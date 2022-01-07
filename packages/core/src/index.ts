import type { Networkish } from '@ethersproject/networks'
import { Web3Provider } from '@ethersproject/providers'
import { createWeb3ReactStoreAndActions } from '@web3-react/store'
import type { Actions, Connector, Web3ReactState } from '@web3-react/types'
import { useEffect, useMemo, useState } from 'react'
import type { EqualityChecker, UseBoundStore } from 'zustand'
import create from 'zustand'

export type Web3ReactHooks = ReturnType<typeof getStateHooks> &
  ReturnType<typeof getDerivedHooks> &
  ReturnType<typeof getAugmentedHooks>

export function initializeConnector<T extends Connector>(
  f: (actions: Actions) => T,
  allowedChainIds?: number[]
): [T, Web3ReactHooks] {
  const [store, actions] = createWeb3ReactStoreAndActions(allowedChainIds)

  const connector = f(actions)
  const useConnector = create<Web3ReactState>(store)

  const stateHooks = getStateHooks(useConnector)
  const derivedHooks = getDerivedHooks(stateHooks)
  const augmentedHooks = getAugmentedHooks(connector, stateHooks, derivedHooks)

  return [connector, { ...stateHooks, ...derivedHooks, ...augmentedHooks }]
}

const CHAIN_ID = (state: Web3ReactState) => state.chainId
const ACCOUNTS = (state: Web3ReactState) => state.accounts
const ACCOUNTS_EQUALITY_CHECKER: EqualityChecker<Web3ReactState['accounts']> = (oldAccounts, newAccounts) =>
  (oldAccounts === undefined && newAccounts === undefined) ||
  (oldAccounts !== undefined &&
    newAccounts !== undefined &&
    oldAccounts.length === newAccounts.length &&
    oldAccounts.every((oldAccount, i) => oldAccount === newAccounts[i]))
const ACTIVATING = (state: Web3ReactState) => state.activating
const ERROR = (state: Web3ReactState) => state.error

function getStateHooks(useConnector: UseBoundStore<Web3ReactState>) {
  function useChainId(): Web3ReactState['chainId'] {
    return useConnector(CHAIN_ID)
  }

  function useAccounts(): Web3ReactState['accounts'] {
    return useConnector(ACCOUNTS, ACCOUNTS_EQUALITY_CHECKER)
  }

  function useIsActivating(): Web3ReactState['activating'] {
    return useConnector(ACTIVATING)
  }

  function useError(): Web3ReactState['error'] {
    return useConnector(ERROR)
  }

  return { useChainId, useAccounts, useIsActivating, useError }
}

function getDerivedHooks({ useChainId, useAccounts, useIsActivating, useError }: ReturnType<typeof getStateHooks>) {
  function useAccount(): string | undefined {
    return useAccounts()?.[0]
  }

  function useIsActive(): boolean {
    const chainId = useChainId()
    const accounts = useAccounts()
    const activating = useIsActivating()
    const error = useError()

    return Boolean(chainId && accounts && !activating && !error)
  }

  return { useAccount, useIsActive }
}

function useENS(provider?: Web3Provider, accounts?: string[]): (string | null)[] | undefined {
  const [ENSNames, setENSNames] = useState<(string | null)[] | undefined>()

  useEffect(() => {
    if (provider && accounts?.length) {
      let stale = false

      Promise.all(accounts.map((account) => provider.lookupAddress(account)))
        .then((ENSNames) => {
          if (!stale) {
            setENSNames(ENSNames)
          }
        })
        .catch((error) => {
          console.debug('Could not fetch ENS names', error)
        })

      return () => {
        stale = true
        setENSNames(undefined)
      }
    }
  }, [provider, accounts])

  return ENSNames
}

function getAugmentedHooks<T extends Connector>(
  connector: T,
  { useChainId, useAccounts, useError }: ReturnType<typeof getStateHooks>,
  { useAccount, useIsActive }: ReturnType<typeof getDerivedHooks>
) {
  function useProvider(network?: Networkish): Web3Provider | undefined {
    const isActive = useIsActive()

    const chainId = useChainId()
    const accounts = useAccounts()

    return useMemo(() => {
      // we use chainId and accounts to re-render in case connector.provider changes in place
      if (isActive && connector.provider && chainId && accounts) {
        return new Web3Provider(connector.provider, network)
      }
    }, [isActive, network, chainId, accounts])
  }

  function useENSNames(provider: Web3Provider | undefined): (string | null)[] | undefined {
    const accounts = useAccounts()

    return useENS(provider, accounts)
  }

  function useENSName(provider: Web3Provider | undefined): (string | null) | undefined {
    const account = useAccount()

    return useENS(provider, account === undefined ? undefined : [account])?.[0]
  }

  // for backwards compatibility only
  function useWeb3React(provider: Web3Provider | undefined) {
    const chainId = useChainId()
    const error = useError()

    const account = useAccount()
    const isActive = useIsActive()

    return useMemo(
      () => ({
        connector,
        library: provider,
        chainId,
        account,
        active: isActive,
        error,
      }),
      [provider, chainId, account, isActive, error]
    )
  }

  return { useProvider, useENSNames, useENSName, useWeb3React }
}
