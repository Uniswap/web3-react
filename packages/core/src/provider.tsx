import type { Networkish } from '@ethersproject/networks'
import type { BaseProvider, Web3Provider } from '@ethersproject/providers'
import type { Connector, Web3ReactStore } from '@web3-react/types'
import type { Context, MutableRefObject, ReactNode } from 'react'
import React, { createContext, useContext, useRef } from 'react'
import type { Web3ReactHooks, Web3ReactPriorityHooks } from './hooks'
import { getPriorityConnector } from './hooks'

/**
 * @typeParam T - A type argument must only be provided if one or more of the connectors passed to Web3ReactProvider
 * is using `connector.customProvider`, in which case it must match every possible type of this
 * property, over all connectors.
 */
export type Web3ContextType<T extends BaseProvider = Web3Provider> = {
  connector: Connector
  chainId: ReturnType<Web3ReactPriorityHooks['useSelectedChainId']>
  accounts: ReturnType<Web3ReactPriorityHooks['useSelectedAccounts']>
  isActivating: ReturnType<Web3ReactPriorityHooks['useSelectedIsActivating']>
  account: ReturnType<Web3ReactPriorityHooks['useSelectedAccount']>
  isActive: ReturnType<Web3ReactPriorityHooks['useSelectedIsActive']>
  provider: T | undefined
  ENSNames: ReturnType<Web3ReactPriorityHooks['useSelectedENSNames']>
  ENSName: ReturnType<Web3ReactPriorityHooks['useSelectedENSName']>
  hooks: ReturnType<typeof getPriorityConnector>
}

const Web3Context = createContext<Web3ContextType | undefined>(undefined)

/**
 * @param children - A React subtree that needs access to the context.
 * @param connectors - Two or more [connector, hooks(, store)] arrays, as returned from initializeConnector.
 * If modified in place without re-rendering the parent component, will result in an error.
 * @param connectorOverride - A connector whose state will be reflected in useWeb3React if set, overriding the
 * priority selection.
 * @param network - An optional argument passed along to `useSelectedProvider`.
 * @param lookupENS - A flag to enable/disable ENS lookups.
 */
export interface Web3ReactProviderProps {
  children: ReactNode
  connectors: [Connector, Web3ReactHooks][] | [Connector, Web3ReactHooks, Web3ReactStore][]
  connectorOverride?: Connector
  network?: Networkish
  lookupENS?: boolean
}

export function Web3ReactProvider({
  children,
  connectors,
  connectorOverride,
  network,
  lookupENS = true,
}: Web3ReactProviderProps) {
  const cachedConnectors: MutableRefObject<Web3ReactProviderProps['connectors']> = useRef(connectors)
  // because we're calling `getPriorityConnector` with these connectors, we need to ensure that they're not changing in place
  if (
    connectors.length != cachedConnectors.current.length ||
    connectors.some((connector, i) => connector !== cachedConnectors.current[i])
  )
    throw new Error(
      'The connectors prop passed to Web3ReactProvider must be referentially static. If connectors is changing, try providing a key prop to Web3ReactProvider that changes every time connectors changes.'
    )

  const hooks = getPriorityConnector(...connectors)
  const {
    usePriorityConnector,
    useSelectedChainId,
    useSelectedAccounts,
    useSelectedIsActivating,
    useSelectedAccount,
    useSelectedIsActive,
    useSelectedProvider,
    useSelectedENSNames,
    useSelectedENSName,
  } = hooks

  const priorityConnector = usePriorityConnector()
  const connector = connectorOverride ?? priorityConnector

  const chainId = useSelectedChainId(connector)
  const accounts = useSelectedAccounts(connector)
  const isActivating = useSelectedIsActivating(connector)
  const account = useSelectedAccount(connector)
  const isActive = useSelectedIsActive(connector)
  // note that we've omitted a <T extends BaseProvider = Web3Provider> generic type
  // in Web3ReactProvider, and thus can't pass T through to useSelectedProvider below.
  // this is because if we did so, the type of provider would include T, but that would
  // conflict because Web3Context can't take a generic. however, this isn't particularly
  // important, because useWeb3React (below) is manually typed
  const provider = useSelectedProvider(connector, network)
  const ENSNames = useSelectedENSNames(connector, lookupENS ? provider : undefined)
  const ENSName = useSelectedENSName(connector, lookupENS ? provider : undefined)

  return (
    <Web3Context.Provider
      value={{
        connector,
        chainId,
        accounts,
        isActivating,
        account,
        isActive,
        provider,
        ENSNames,
        ENSName,
        hooks,
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
