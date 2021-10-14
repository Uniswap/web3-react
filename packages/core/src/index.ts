import { createWeb3ReactStoreAndActions } from '@web3-react/store'
import { Connector, Web3ReactState, Actions } from '@web3-react/types'
import create, { UseStore } from 'zustand'
import { useEffect, useMemo, useState } from 'react'
import { Web3Provider } from '@ethersproject/providers'

export type Web3ReactHooks = ReturnType<typeof getStateHooks> &
  ReturnType<typeof getDerivedHooks> &
  ReturnType<typeof getAugmentedHooks>

export function initializeConnector<T extends Connector>(f: (actions: Actions) => T): [T, Web3ReactHooks] {
  const [store, actions] = createWeb3ReactStoreAndActions()

  const connector = f(actions)
  const useConnector = create<Web3ReactState>(store)

  const stateHooks = getStateHooks(useConnector)
  const derivedHooks = getDerivedHooks(stateHooks)

  const augmentedHooks = getAugmentedHooks(connector, stateHooks, derivedHooks)

  return [connector, { ...stateHooks, ...derivedHooks, ...augmentedHooks }]
}

const CHAIN_ID = (state: Web3ReactState) => state.chainId
const ACCOUNTS = (state: Web3ReactState) => state.accounts
const ACTIVATING = (state: Web3ReactState) => state.activating
const ERROR = (state: Web3ReactState) => state.error

function getStateHooks(useConnector: UseStore<Web3ReactState>) {
  function useChainId(): Web3ReactState['chainId'] {
    return useConnector(CHAIN_ID)
  }

  function useAccounts(): Web3ReactState['accounts'] {
    return useConnector(ACCOUNTS)
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

function useENS(provider?: Web3Provider, accounts?: string[]): string[] | undefined {
  const [ENSNames, setENSNames] = useState<string[] | undefined>()

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
  function useProvider(): Web3Provider | undefined {
    const isActive = useIsActive()

    const chainId = useChainId()
    const accounts = useChainId()

    // we use chainId and accounts to re-render in case connector.provider changes in place
    const { provider } = connector

    return useMemo(() => {
      if (isActive && provider) {
        return new Web3Provider(provider)
      }
    }, [isActive, provider, chainId, accounts])
  }

  function useENSNames(): string[] | undefined {
    const provider = useProvider()
    const accounts = useAccounts()

    return useENS(provider, accounts)
  }

  function useENSName(): string | undefined {
    const provider = useProvider()
    const account = useAccount()

    return useENS(provider, typeof account === 'undefined' ? undefined : [account])?.[0]
  }

  // for backwards compatibility only
  function useWeb3React() {
    const chainId = useChainId()
    const error = useError()

    const account = useAccount()
    const isActive = useIsActive()

    const provider = useProvider()

    return {
      connector,
      library: provider,
      chainId,
      account,
      active: isActive,
      error,
    }
  }

  return { useProvider, useENSNames, useENSName, useWeb3React }
}
