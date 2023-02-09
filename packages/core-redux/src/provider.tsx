import type { Networkish } from '@ethersproject/networks'
import type { BaseProvider, Web3Provider } from '@ethersproject/providers'
import type { Connector, Web3ReactReduxStore } from '@web3-react/types'
import { Dispatch, SetStateAction } from 'react'
import React, {
  Context,
  createContext,
  MutableRefObject,
  ReactNode,
  useCallback,
  useContext,
  useRef,
  useState,
} from 'react'

import type { Web3ReactHooks, Web3ReactPriorityHooks } from './hooks'
import { getPriorityConnectorHooks } from './hooks'

/**
 * @typeParam T - A type argument must only be provided if one or more of the connectors passed to Web3ReactProvider
 * is using `connector.customProvider`, in which case it must match every possible type of this
 * property, over all connectors.
 */
export type Web3ContextType<T extends BaseProvider = Web3Provider> = {
  connector: Connector
  chainId: ReturnType<Web3ReactPriorityHooks['useSelectedChainId']>
  accountIndex: ReturnType<Web3ReactPriorityHooks['useSelectedAccountIndex']>
  accounts: ReturnType<Web3ReactPriorityHooks['useSelectedAccounts']>
  account: ReturnType<Web3ReactPriorityHooks['useSelectedAccount']>
  isActivating: ReturnType<Web3ReactPriorityHooks['useSelectedIsActivating']>
  isActive: ReturnType<Web3ReactPriorityHooks['useSelectedIsActive']>
  provider: T | undefined
  ENSNames: ReturnType<Web3ReactPriorityHooks['useSelectedENSNames']>
  ENSName: ReturnType<Web3ReactPriorityHooks['useSelectedENSName']>
  ENSAvatars: ReturnType<Web3ReactPriorityHooks['useSelectedENSAvatars']>
  ENSAvatar: ReturnType<Web3ReactPriorityHooks['useSelectedENSAvatar']>
  addingChain: ReturnType<Web3ReactPriorityHooks['useSelectedAddingChain']>
  switchingChain: ReturnType<Web3ReactPriorityHooks['useSelectedSwitchingChain']>
  watchingAsset: ReturnType<Web3ReactPriorityHooks['useSelectedWatchingAsset']>
  hooks: ReturnType<typeof getPriorityConnectorHooks>
  setSelectedConnector: (connector?: Connector) => void
  setLookupENS: Dispatch<SetStateAction<boolean>>
}

const Web3Context = createContext<Web3ContextType | undefined>(undefined)

/**
 * @param children - A React subtree that needs access to the context.
 * @param connectors - Two or more [connector, hooks(, store)] arrays, as returned from initializeConnector.
 * If modified in place without re-rendering the parent component, will result in an error.
 * @param defaultSelectedConnector - A connector whose state will be reflected in useWeb3React if set, overriding the
 * priority selection.
 * @param network - An optional argument passed along to `useSelectedProvider`.
 * @param lookupENS - A flag to enable/disable ENS lookups.
 */
export interface Web3ReactProviderProps {
  children: ReactNode
  connectors: [Connector, Web3ReactHooks][] | [Connector, Web3ReactHooks, Web3ReactReduxStore][]
  defaultSelectedConnector?: Connector
  network?: Networkish
  lookupENS?: boolean
}

export function Web3ReactProvider({
  children,
  connectors,
  defaultSelectedConnector,
  network,
  lookupENS = true,
}: Web3ReactProviderProps) {
  const cachedConnectors: MutableRefObject<Web3ReactProviderProps['connectors']> = useRef(connectors)
  // because we're calling `getPriorityConnectorHooks` with these connectors, we need to ensure that they're not changing in place
  if (
    connectors.length != cachedConnectors.current.length ||
    connectors.some((connector, i) => {
      const cachedConnector = cachedConnectors.current[i]
      // because a "connector" is actually an array, we want to be sure to only perform an equality check on the actual Connector
      // class instance, to see if they're the same object
      return connector[0] !== cachedConnector[0]
    })
  )
    throw new Error(
      'The connectors prop passed to Web3ReactProvider must be referentially static. If connectors is changing, try providing a key prop to Web3ReactProvider that changes every time connectors changes.'
    )

  const hooks = getPriorityConnectorHooks(...connectors)
  const {
    usePriorityConnector,
    useSelectedChainId,
    useSelectedAccountIndex,
    useSelectedAccounts,
    useSelectedAccount,
    useSelectedIsActivating,
    useSelectedIsActive,
    useSelectedProvider,
    useSelectedENSNames,
    useSelectedENSName,
    useSelectedENSAvatars,
    useSelectedENSAvatar,
    useSelectedAddingChain,
    useSelectedSwitchingChain,
    useSelectedWatchingAsset,
  } = hooks

  const firstActiveConnector = usePriorityConnector()
  const fallbackConnector = defaultSelectedConnector ?? firstActiveConnector
  const [connector, setConnector] = useState<Connector>(fallbackConnector)
  const [isLookup, setLookupENS] = useState<boolean>(lookupENS)

  const setSelectedConnector = useCallback(
    (proposedConnector?: Connector) => {
      if (proposedConnector) {
        const isCached = cachedConnectors.current.some((cachedConnector) => cachedConnector[0] === connector)
        setConnector(isCached ? proposedConnector : fallbackConnector)
      } else {
        setConnector(fallbackConnector)
      }
    },
    [connector, fallbackConnector]
  )

  const chainId = useSelectedChainId(connector)
  const accountIndex = useSelectedAccountIndex(connector)
  const accounts = useSelectedAccounts(connector)
  const account = useSelectedAccount(connector)
  const isActivating = useSelectedIsActivating(connector)
  const isActive = useSelectedIsActive(connector)

  // note that we've omitted a <T extends BaseProvider = Web3Provider> generic type
  // in Web3ReactProvider, and thus can't pass T through to useSelectedProvider below.
  // this is because if we did so, the type of provider would include T, but that would
  // conflict because Web3Context can't take a generic. however, this isn't particularly
  // important, because useWeb3React (below) is manually typed
  const provider = useSelectedProvider(connector, network)
  const ENSNames = useSelectedENSNames(connector, isLookup ? provider : undefined)
  const ENSName = useSelectedENSName(connector, isLookup ? provider : undefined)
  const ENSAvatars = useSelectedENSAvatars(connector, isLookup ? provider : undefined, ENSNames)
  const ENSAvatar = useSelectedENSAvatar(connector, isLookup ? provider : undefined, ENSName)

  const addingChain = useSelectedAddingChain(connector)
  const switchingChain = useSelectedSwitchingChain(connector)
  const watchingAsset = useSelectedWatchingAsset(connector)

  return (
    <Web3Context.Provider
      value={{
        accountIndex,
        accounts,
        account,

        provider,
        chainId,

        isActivating,
        isActive,

        setSelectedConnector,
        connector,

        setLookupENS,
        ENSNames,
        ENSName,
        ENSAvatars,
        ENSAvatar,

        hooks,

        addingChain,
        switchingChain,
        watchingAsset,
      }}
    >
      {children}
    </Web3Context.Provider>
  )
}

export function useWeb3React<T extends BaseProvider = Web3Provider>(): Web3ContextType<T> {
  const context = useContext(Web3Context as Context<Web3ContextType<T> | undefined>)
  if (!context) throw Error('useWeb3React can only be used within the Web3ReactProvider component')
  return context
}
