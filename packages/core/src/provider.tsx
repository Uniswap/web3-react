import type { Networkish } from '@ethersproject/networks'
import type { Connector } from '@web3-react/types'
import type { ReactNode } from 'react'
import React, { createContext, useContext } from 'react'
import type { Web3ReactHooks, Web3ReactPriorityHooks } from './hooks'
import { getPriorityConnector } from './hooks'

type Web3ContextType = {
  connector: ReturnType<Web3ReactPriorityHooks['usePriorityConnector']>
  chainId: ReturnType<Web3ReactPriorityHooks['usePriorityChainId']>
  accounts: ReturnType<Web3ReactPriorityHooks['usePriorityAccounts']>
  isActivating: ReturnType<Web3ReactPriorityHooks['usePriorityIsActivating']>
  error: ReturnType<Web3ReactPriorityHooks['usePriorityError']>
  account: ReturnType<Web3ReactPriorityHooks['usePriorityAccount']>
  isActive: ReturnType<Web3ReactPriorityHooks['usePriorityIsActive']>
  provider: ReturnType<Web3ReactPriorityHooks['usePriorityProvider']>
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

export function useWeb3React() {
  const web3 = useContext(Web3Context)
  if (!web3) throw Error('useWeb3React can only be used within the Web3ReactProvider component')
  return web3
}
