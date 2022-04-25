import type { Networkish } from '@ethersproject/networks'
import type { BaseProvider, Web3Provider } from '@ethersproject/providers'
import type { Connector } from '@web3-react/types'
import type { Context, ReactNode } from 'react'
import React, { createContext, useContext } from 'react'
import type { Web3ReactHooks, Web3ReactPriorityHooks } from './hooks'
import { getPriorityConnector } from './hooks'

/**
 * @typeParam T - A type argument must only be provided if one or more of the connectors passed to Web3ReactProvider
 * is using `connector.customProvider`, in which case it must match every possible type of this
 * property, over all connectors.
 */
export type Web3ContextType<T extends BaseProvider = Web3Provider> = {
  connector: ReturnType<Web3ReactPriorityHooks['usePriorityConnector']>
  chainId: ReturnType<Web3ReactPriorityHooks['usePriorityChainId']>
  accounts: ReturnType<Web3ReactPriorityHooks['usePriorityAccounts']>
  isActivating: ReturnType<Web3ReactPriorityHooks['usePriorityIsActivating']>
  error: ReturnType<Web3ReactPriorityHooks['usePriorityError']>
  account: ReturnType<Web3ReactPriorityHooks['usePriorityAccount']>
  isActive: ReturnType<Web3ReactPriorityHooks['usePriorityIsActive']>
  provider: T | undefined
  ENSNames: ReturnType<Web3ReactPriorityHooks['usePriorityENSNames']>
  ENSName: ReturnType<Web3ReactPriorityHooks['usePriorityENSName']>
}

const Web3Context = createContext<Web3ContextType | undefined>(undefined)

export function Web3ReactProvider({
  children,
  connectors,
  network,
  lookupENS = true,
}: {
  children: ReactNode
  connectors: [Connector, Web3ReactHooks][]
  network?: Networkish
  lookupENS?: boolean
}) {
  const {
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
  } = getPriorityConnector(...connectors)

  const connector = usePriorityConnector()
  const chainId = usePriorityChainId()
  const accounts = usePriorityAccounts()
  const isActivating = usePriorityIsActivating()
  const error = usePriorityError()
  const account = usePriorityAccount()
  const isActive = usePriorityIsActive()
  // note that we've omitted a <T extends BaseProvider = Web3Provider> generic type
  // in Web3ReactProvider, and thus can't pass T through to usePriorityProvider below.
  // this is because if we did so, the type of provider would include T, but that would
  // conflict because Web3Context can't take a generic. however, this isn't particularly
  // important, because useWeb3React (below) is manually typed
  const provider = usePriorityProvider(network)
  const ENSNames = usePriorityENSNames(lookupENS ? provider : undefined)
  const ENSName = usePriorityENSName(lookupENS ? provider : undefined)

  return (
    <Web3Context.Provider
      value={{
        connector,
        chainId,
        accounts,
        isActivating,
        error,
        account,
        isActive,
        provider,
        ENSNames,
        ENSName,
      }}
    >
      {children}
    </Web3Context.Provider>
  )
}

export function useWeb3React<T extends BaseProvider = Web3Provider>() {
  const web3 = useContext(Web3Context as Context<Web3ContextType<T> | undefined>)
  if (!web3) throw Error('useWeb3React can only be used within the Web3ReactProvider component')
  return web3
}
