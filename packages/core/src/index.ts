import type { Networkish } from '@ethersproject/networks'
import { Web3Provider } from '@ethersproject/providers'
import { createWeb3ReactStoreAndActions } from '@web3-react/store'
import type { Actions, Connector, Web3ReactState, Web3ReactStore } from '@web3-react/types'
import { useEffect, useMemo, useState } from 'react'
import type { EqualityChecker, UseBoundStore } from 'zustand'
import create from 'zustand'

export type Web3ReactHooks = ReturnType<typeof getStateHooks> &
  ReturnType<typeof getDerivedHooks> &
  ReturnType<typeof getAugmentedHooks>

export function initializeConnector<T extends Connector>(
  f: (actions: Actions) => T,
  allowedChainIds?: number[]
): [T, Web3ReactHooks, Web3ReactStore] {
  const [store, actions] = createWeb3ReactStoreAndActions(allowedChainIds)

  const connector = f(actions)
  const useConnector = create<Web3ReactState>(store)

  const stateHooks = getStateHooks(useConnector)
  const derivedHooks = getDerivedHooks(stateHooks)
  const augmentedHooks = getAugmentedHooks(connector, stateHooks, derivedHooks)

  return [connector, { ...stateHooks, ...derivedHooks, ...augmentedHooks }, store]
}

function computeIsActive({ chainId, accounts, activating, error }: Web3ReactState) {
  return Boolean(chainId && accounts && !activating && !error)
}

export function getPriorityConnector(...initializedConnectors: [Connector, Web3ReactHooks][]) {
  function useActiveIndex() {
    // the following is ok because initializedConnectors never changes so the hooks are always the same
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const areActive = initializedConnectors.map(([, { useIsActive }]) => useIsActive())
    const index = areActive.findIndex((isActive) => isActive)
    return index === -1 ? undefined : index
  }

  function usePriorityConnector() {
    return initializedConnectors[useActiveIndex() ?? 0][0]
  }

  function usePriorityChainId() {
    return initializedConnectors[useActiveIndex() ?? 0][1].useChainId()
  }

  function usePriorityAccounts() {
    return initializedConnectors[useActiveIndex() ?? 0][1].useAccounts()
  }

  function usePriorityIsActivating() {
    return initializedConnectors[useActiveIndex() ?? 0][1].useIsActivating()
  }

  function usePriorityError() {
    return initializedConnectors[useActiveIndex() ?? 0][1].useError()
  }

  function usePriorityAccount() {
    return initializedConnectors[useActiveIndex() ?? 0][1].useAccount()
  }

  function usePriorityIsActive() {
    return initializedConnectors[useActiveIndex() ?? 0][1].useIsActive()
  }

  function usePriorityProvider(...args: Parameters<Web3ReactHooks['useProvider']>) {
    return initializedConnectors[useActiveIndex() ?? 0][1].useProvider(...args)
  }

  function usePriorityENSNames(...args: Parameters<Web3ReactHooks['useENSNames']>) {
    return initializedConnectors[useActiveIndex() ?? 0][1].useENSNames(...args)
  }

  function usePriorityENSName(...args: Parameters<Web3ReactHooks['useENSName']>) {
    return initializedConnectors[useActiveIndex() ?? 0][1].useENSName(...args)
  }

  function usePriorityWeb3React(...args: Parameters<Web3ReactHooks['useWeb3React']>) {
    return initializedConnectors[useActiveIndex() ?? 0][1].useWeb3React(...args)
  }

  return {
    usePriorityConnector,
    usePriorityChainId,
    usePriorityAccounts,
    usePriorityIsActivating,
    usePriorityError,
    usePriorityAccount,
    usePriorityIsActive,
    usePriorityProvider,
    usePriorityENSNames,
    usePriorityENSName,
    usePriorityWeb3React,
  }
}

const CHAIN_ID = (state: Web3ReactState) => state.chainId
const ACCOUNTS = (state: Web3ReactState) => state.accounts
const ACCOUNTS_EQUALITY_CHECKER: EqualityChecker<Web3ReactState['accounts']> = (oldAccounts, newAccounts) =>
  (oldAccounts === undefined && newAccounts === undefined) ||
  (oldAccounts !== undefined &&
    oldAccounts.length === newAccounts?.length &&
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

    return computeIsActive({
      chainId,
      accounts,
      activating,
      error,
    })
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
    const accounts = useMemo(() => (account === undefined ? undefined : [account]), [account])
    return useENS(provider, accounts)?.[0]
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
