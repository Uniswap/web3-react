import type { Networkish } from '@ethersproject/networks'
import type { BaseProvider, Web3Provider } from '@ethersproject/providers'
import { createWeb3ReactStoreAndActions } from '@web3-react/store-redux'
import type {
  Actions,
  Connector,
  Web3PrioritySelectors,
  Web3ReactReduxStore,
  Web3ReactState,
  Web3SelectedSelectors,
} from '@web3-react/types'
import { useEffect, useMemo, useState } from 'react'
import { useSyncExternalStoreWithSelector } from 'use-sync-external-store/with-selector'

let DynamicProvider: typeof Web3Provider | null | undefined
async function importProvider(): Promise<void> {
  if (DynamicProvider === undefined) {
    try {
      const { Web3Provider } = await import('@ethersproject/providers')
      DynamicProvider = Web3Provider
    } catch {
      console.debug('@ethersproject/providers not available')
      DynamicProvider = null
    }
  }
}

export type Web3ReactHooks = ReturnType<typeof getStateHooks> &
  ReturnType<typeof getDerivedHooks> &
  ReturnType<typeof getAugmentedHooks>

export type Web3ReactSelectedHooks = ReturnType<typeof getSelectedConnectorHooks>

export type Web3ReactPriorityHooks = ReturnType<typeof getPriorityConnectorHooks>

/**
 * Wraps the initialization of a `connector`. Creates a redux `store` with `actions` bound to it, and then passes
 * these to the connector as specified in `f`. Also creates a variety of `hooks` bound to this `store`.
 *
 * @typeParam T - The type of the `connector` returned from `f`.
 * @param f - A function which is called with `actions` bound to the returned `store`.
 * @returns [connector, hooks, store] - The initialized connector, a variety of hooks, and a redux store.
 */
export function initializeConnector<T extends Connector>(
  f: (actions: Actions) => T,
  connectorName?: string
): [T, Web3ReactHooks, Web3ReactReduxStore] {
  const [store, actions] = createWeb3ReactStoreAndActions(connectorName)

  const connector = f(actions)

  const stateHooks = getStateHooks(store)
  const derivedHooks = getDerivedHooks(stateHooks)
  const augmentedHooks = getAugmentedHooks<T>(connector, stateHooks, derivedHooks)

  return [connector, { ...stateHooks, ...derivedHooks, ...augmentedHooks }, store]
}

function computeIsActive({ chainId, accounts, activating }: Partial<Web3ReactState>) {
  return Boolean(chainId && accounts && !activating)
}

/**
 * Creates a variety of convenience `hooks` that return data associated with a particular passed connector.
 *
 * @param initializedConnectors - Two or more [connector, hooks(, store)] arrays, as returned from initializeConnector.
 * @returns hooks - A variety of convenience hooks that wrap the hooks returned from initializeConnector.
 */
export function getSelectedConnectorHooks(
  ...initializedConnectors: [Connector, Web3ReactHooks][] | [Connector, Web3ReactHooks, Web3ReactReduxStore][]
): Web3SelectedSelectors {
  const getIndex = (connector: Connector) => {
    const index = initializedConnectors.findIndex(([initializedConnector]) => connector === initializedConnector)
    if (index === -1) throw new Error('Connector not found')
    return index
  }

  const useSelectedStore = (connector: Connector) => {
    const store = initializedConnectors[getIndex(connector)][2]
    if (!store) throw new Error('Stores not passed')
    return store
  }

  // the following code calls hooks in a map a lot, which violates the eslint rule.
  // this is ok, though, because initializedConnectors never changes, so the same hooks are called each time
  const useSelectedChainId = (connector: Connector) => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const values = initializedConnectors.map(([, { useChainId }]) => useChainId())
    return values[getIndex(connector)]
  }

  const useSelectedAccounts = (connector: Connector) => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const values = initializedConnectors.map(([, { useAccounts }]) => useAccounts())
    return values[getIndex(connector)]
  }

  const useSelectedAccountIndex = (connector: Connector) => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const values = initializedConnectors.map(([, { useAccountIndex }]) => useAccountIndex())
    return values[getIndex(connector)]
  }

  const useSelectedIsActivating = (connector: Connector) => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const values = initializedConnectors.map(([, { useIsActivating }]) => useIsActivating())
    return values[getIndex(connector)]
  }

  const useSelectedAccount = (connector: Connector) => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const values = initializedConnectors.map(([, { useAccount }]) => useAccount())
    return values[getIndex(connector)]
  }

  const useSelectedIsActive = (connector: Connector) => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const values = initializedConnectors.map(([, { useIsActive }]) => useIsActive())
    return values[getIndex(connector)]
  }

  /**
   * @typeParam T - A type argument must only be provided if one or more of the connectors passed to
   * getSelectedConnectorHooks is using `connector.customProvider`, in which case it must match every possible type of this
   * property, over all connectors.
   */
  const useSelectedProvider = <T extends BaseProvider = Web3Provider>(
    connector: Connector,
    network?: Networkish
  ): T | undefined => {
    const index = getIndex(connector)
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const values = initializedConnectors.map(([, { useProvider }], i) => useProvider<T>(network, i === index))
    return values[index]
  }

  const useSelectedENSNames = (connector: Connector, provider?: BaseProvider) => {
    const index = getIndex(connector)
    const values = initializedConnectors.map(([, { useENSNames }], i) =>
      // eslint-disable-next-line react-hooks/rules-of-hooks
      useENSNames(i === index ? provider : undefined)
    )
    return values[index]
  }

  const useSelectedENSName = (connector: Connector, provider?: BaseProvider) => {
    const index = getIndex(connector)
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const values = initializedConnectors.map(([, { useENSName }], i) => useENSName(i === index ? provider : undefined))
    return values[index]
  }

  const useSelectedENSAvatars = (connector: Connector, provider?: BaseProvider, ensNames?: (string | null)[]) => {
    const index = getIndex(connector)
    const values = initializedConnectors.map(([, { useENSAvatars }], i) =>
      // eslint-disable-next-line react-hooks/rules-of-hooks
      useENSAvatars(i === index ? provider : undefined, ensNames)
    )
    return values[index]
  }

  const useSelectedENSAvatar = (connector: Connector, provider?: BaseProvider, ensName?: string | null | undefined) => {
    const index = getIndex(connector)
    const values = initializedConnectors.map(([, { useENSAvatar }], i) =>
      // eslint-disable-next-line react-hooks/rules-of-hooks
      useENSAvatar(i === index ? provider : undefined, ensName)
    )
    return values[index]
  }

  const useSelectedAddingChain = (connector: Connector) => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const values = initializedConnectors.map(([, { useAddingChain }]) => useAddingChain())
    return values[getIndex(connector)]
  }

  const useSelectedSwitchingChain = (connector: Connector) => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const values = initializedConnectors.map(([, { useSwitchingChain }]) => useSwitchingChain())
    return values[getIndex(connector)]
  }

  const useSelectedWatchingAsset = (connector: Connector) => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const values = initializedConnectors.map(([, { useWatchingAsset }]) => useWatchingAsset())
    return values[getIndex(connector)]
  }

  return {
    useSelectedStore,
    useSelectedChainId,
    useSelectedAccounts,
    useSelectedAccountIndex,
    useSelectedIsActivating,
    useSelectedAccount,
    useSelectedIsActive,
    useSelectedProvider,
    useSelectedENSNames,
    useSelectedENSName,
    useSelectedENSAvatars,
    useSelectedENSAvatar,
    useSelectedAddingChain,
    useSelectedSwitchingChain,
    useSelectedWatchingAsset,
  }
}

/**
 * Creates a variety of convenience `hooks` that return data associated with the first of the `initializedConnectors`
 * that is active.
 *
 * @param initializedConnectors - Two or more [connector, hooks(, store)] arrays, as returned from initializeConnector.
 * @returns hooks - A variety of convenience hooks that wrap the hooks returned from initializeConnector.
 */
export function getPriorityConnectorHooks(
  ...initializedConnectors: [Connector, Web3ReactHooks][] | [Connector, Web3ReactHooks, Web3ReactReduxStore][]
): Web3SelectedSelectors & Web3PrioritySelectors {
  const {
    useSelectedStore,
    useSelectedChainId,
    useSelectedAccounts,
    useSelectedAccountIndex,
    useSelectedIsActivating,
    useSelectedAccount,
    useSelectedIsActive,
    useSelectedProvider,
    useSelectedENSNames,
    useSelectedENSName,
    useSelectedENSAvatars,
    useSelectedENSAvatar,
    useSelectedAddingChain,
    useSelectedSwitchingChain,
    useSelectedWatchingAsset,
  } = getSelectedConnectorHooks(...initializedConnectors)

  const usePriorityConnector = () => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const values = initializedConnectors.map(([, { useIsActive }]) => useIsActive())
    const index = values.findIndex((isActive) => isActive)
    return initializedConnectors[index === -1 ? 0 : index][0]
  }

  const usePriorityStore = () => {
    return useSelectedStore(usePriorityConnector())
  }

  const usePriorityChainId = () => {
    return useSelectedChainId(usePriorityConnector())
  }

  const usePriorityAccounts = () => {
    return useSelectedAccounts(usePriorityConnector())
  }

  const usePriorityAccountIndex = () => {
    return useSelectedAccountIndex(usePriorityConnector())
  }

  const usePriorityIsActivating = () => {
    return useSelectedIsActivating(usePriorityConnector())
  }

  const usePriorityAccount = () => {
    return useSelectedAccount(usePriorityConnector())
  }

  const usePriorityIsActive = () => {
    return useSelectedIsActive(usePriorityConnector())
  }

  /**
   * @typeParam T - A type argument must only be provided if one or more of the connectors passed to
   * getPriorityConnectorHooks is using `connector.customProvider`, in which case it must match every possible type of this
   * property, over all connectors.
   */
  const usePriorityProvider = <T extends BaseProvider = Web3Provider>(network?: Networkish) => {
    return useSelectedProvider<T>(usePriorityConnector(), network)
  }

  const usePriorityENSNames = (provider?: BaseProvider) => {
    return useSelectedENSNames(usePriorityConnector(), provider)
  }

  const usePriorityENSName = (provider?: BaseProvider) => {
    return useSelectedENSName(usePriorityConnector(), provider)
  }

  const usePriorityENSAvatars = (provider?: BaseProvider) => {
    return useSelectedENSAvatars(usePriorityConnector(), provider)
  }

  const usePriorityENSAvatar = (provider?: BaseProvider) => {
    return useSelectedENSAvatar(usePriorityConnector(), provider)
  }

  const usePriorityAddingChain = () => {
    return useSelectedAddingChain(usePriorityConnector())
  }

  const usePrioritySwitchingChain = () => {
    return useSelectedSwitchingChain(usePriorityConnector())
  }

  const usePriorityWatchingAsset = () => {
    return useSelectedWatchingAsset(usePriorityConnector())
  }

  return {
    useSelectedStore,
    useSelectedChainId,
    useSelectedAccounts,
    useSelectedAccountIndex,
    useSelectedIsActivating,
    useSelectedAccount,
    useSelectedIsActive,
    useSelectedProvider,
    useSelectedENSNames,
    useSelectedENSName,
    useSelectedENSAvatars,
    useSelectedENSAvatar,
    useSelectedAddingChain,
    useSelectedSwitchingChain,
    useSelectedWatchingAsset,
    usePriorityConnector,
    usePriorityStore,
    usePriorityChainId,
    usePriorityAccounts,
    usePriorityAccountIndex,
    usePriorityIsActivating,
    usePriorityAccount,
    usePriorityIsActive,
    usePriorityProvider,
    usePriorityENSNames,
    usePriorityENSName,
    usePriorityENSAvatars,
    usePriorityENSAvatar,
    usePriorityAddingChain,
    usePrioritySwitchingChain,
    usePriorityWatchingAsset,
  }
}

const CHAIN_ID = ({ chainId }: Web3ReactState) => chainId
const ACCOUNT_INDEX = ({ accountIndex }: Web3ReactState) => accountIndex
const ACCOUNTS = ({ accounts }: Web3ReactState) => accounts
const ACCOUNTS_EQUALITY_CHECKER = (oldAccounts?: string[], newAccounts?: string[]) =>
  (oldAccounts === undefined && newAccounts === undefined) ||
  (oldAccounts !== undefined &&
    oldAccounts.length === newAccounts?.length &&
    oldAccounts.every((oldAccount: string, i: number) => oldAccount === newAccounts[i]))
const ACTIVATING = ({ activating }: Web3ReactState) => activating
const ADDING = ({ addingChain }: Web3ReactState) => addingChain
const SWITCHING = ({ switchingChain }: Web3ReactState) => switchingChain
const WATCHING = ({ watchingAsset }: Web3ReactState) => watchingAsset

function useStore<U>(
  store: Web3ReactReduxStore,
  selector: (state: Web3ReactState) => U,
  equalityFn?: (a: U, b: U) => boolean
): U {
  // eslint-disable-next-line @typescript-eslint/unbound-method
  return useSyncExternalStoreWithSelector(store.subscribe, store.getState, store.getState, selector, equalityFn)
}

function getStateHooks(store: Web3ReactReduxStore) {
  function useChainId(): Web3ReactState['chainId'] {
    return useStore(store, CHAIN_ID)
  }

  function useAccounts(): Web3ReactState['accounts'] {
    return useStore(store, ACCOUNTS, ACCOUNTS_EQUALITY_CHECKER)
  }

  function useAccountIndex(): Web3ReactState['accountIndex'] {
    return useStore(store, ACCOUNT_INDEX)
  }

  function useIsActivating(): Web3ReactState['activating'] {
    return useStore(store, ACTIVATING)
  }

  function useAddingChain(): Web3ReactState['addingChain'] {
    return useStore(store, ADDING)
  }

  function useSwitchingChain(): Web3ReactState['switchingChain'] {
    return useStore(store, SWITCHING)
  }

  function useWatchingAsset(): Web3ReactState['watchingAsset'] {
    return useStore(store, WATCHING)
  }

  return {
    useChainId,
    useAccounts,
    useAccountIndex,
    useIsActivating,
    useAddingChain,
    useSwitchingChain,
    useWatchingAsset,
  }
}

function getDerivedHooks({
  useChainId,
  useAccounts,
  useAccountIndex,
  useIsActivating,
}: ReturnType<typeof getStateHooks>) {
  function useAccount(): string | undefined {
    const accounts = useAccounts()
    const accountIndex = useAccountIndex()
    return accounts?.length && (accountIndex || accountIndex === 0) && accountIndex >= 0
      ? accounts?.[accountIndex]
      : undefined
  }

  function useIsActive(): boolean {
    const chainId = useChainId()
    const accounts = useAccounts()
    const activating = useIsActivating()

    return computeIsActive({
      chainId,
      accounts,
      activating,
    })
  }

  return { useAccount, useIsActive }
}

/**
 * @returns ENSNames - An array of length `accounts.length` which contains entries which are either all `undefined`,
 * indicated that names cannot be fetched because there's no provider, or they're in the process of being fetched,
 * or `string | null`, depending on whether an ENS name has been set for the account in question or not.
 */
function useENS(provider?: BaseProvider, accounts: string[] = []): (string | null)[] {
  const [ENSNames, setENSNames] = useState<(string | null)[] | undefined>()

  useEffect(() => {
    if (provider && accounts.length && provider?.lookupAddress) {
      let stale = false

      Promise.all(accounts.map((account) => provider.lookupAddress(account)))
        .then((ENSNames) => {
          if (stale) return
          setENSNames(ENSNames)
        })
        .catch((error) => {
          if (stale) return
          console.debug('Could not fetch ENS names', error)
          setENSNames(new Array<null>(accounts.length).fill(null))
        })

      return () => {
        stale = true
        setENSNames(undefined)
      }
    }
  }, [provider, accounts])

  return ENSNames ?? new Array<null>(accounts.length).fill(null)
}

function useAvatar(provider?: BaseProvider, ensNames?: (string | null)[]): (string | null)[] | undefined {
  const [ENSAvatars, setENSAvatars] = useState<(string | null)[] | undefined>()

  useEffect(() => {
    if (provider && ensNames?.length) {
      let stale = false

      Promise.all(ensNames.map((name) => (name ? provider.getAvatar(name) : Promise.resolve(null))))
        .then((ENSAvatars) => {
          if (stale) return
          setENSAvatars(ENSAvatars)
        })
        .catch((error) => {
          if (stale) return
          console.debug('Could not fetch ENS avatars', error)
          setENSAvatars(undefined)
        })

      return () => {
        stale = true
        setENSAvatars(undefined)
      }
    } else {
      setENSAvatars(undefined)
    }
  }, [provider, ensNames])

  return ENSAvatars
}

function getAugmentedHooks<T extends Connector>(
  connector: T,
  { useAccounts, useChainId }: ReturnType<typeof getStateHooks>,
  { useAccount, useIsActive }: ReturnType<typeof getDerivedHooks>
) {
  /**
   * Avoid type erasure by returning the most qualified type if not otherwise set.
   * Note that this function's return type is `T | undefined`, but there is a code path
   * that returns a Web3Provider, which could conflict with a user-provided T. So,
   * it's important that users only provide an override for T if they know that
   * `connector.customProvider` is going to be defined and of type T.
   *
   * @typeParam T - A type argument must only be provided if using `connector.customProvider`, in which case it
   * must match the type of this property.
   */
  function useProvider<T extends BaseProvider = Web3Provider>(network?: Networkish, enabled = true): T | undefined {
    const isActive = useIsActive()
    const chainId = useChainId()

    // ensure that Provider is going to be available when loaded if @ethersproject/providers is installed
    const [loaded, setLoaded] = useState(DynamicProvider !== undefined)
    useEffect(() => {
      if (loaded) return
      let stale = false
      void importProvider().then(() => {
        if (stale) return
        setLoaded(true)
      })
      return () => {
        stale = true
      }
    }, [loaded])

    return useMemo(() => {
      // to ensure connectors remain fresh, we condition re-renders on loaded, isActive and chainId
      void loaded && isActive && chainId
      if (enabled) {
        if (connector.customProvider) return connector.customProvider as T
        // see tsdoc note above for return type explanation.
        else if (DynamicProvider && connector.provider)
          return new DynamicProvider(connector.provider, network) as unknown as T
      }
    }, [loaded, enabled, isActive, chainId, network])
  }

  function useENSNames(provider?: BaseProvider): (string | null)[] {
    const accounts = useAccounts()
    return useENS(provider, accounts)
  }

  function useENSName(provider?: BaseProvider): undefined | string | null {
    const account = useAccount()
    const accounts = useMemo(() => (account === undefined ? undefined : [account]), [account])
    return useENS(provider, accounts)?.[0]
  }

  function useENSAvatars(provider?: BaseProvider, ensNames?: (string | null)[]): (string | null)[] | undefined {
    const names = useMemo(() => {
      return ensNames?.every((name) => !name) ? undefined : ensNames
    }, [ensNames])

    return useAvatar(provider, names)
  }

  function useENSAvatar(provider?: BaseProvider, ensName?: undefined | string | null): undefined | string | null {
    const ensNames = useMemo(() => (ensName === undefined ? undefined : [ensName]), [ensName])
    return useAvatar(provider, ensNames)?.[0]
  }

  return { useProvider, useENSNames, useENSName, useENSAvatars, useENSAvatar }
}
