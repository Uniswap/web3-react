import React from 'react'
import type { Web3Provider } from '@ethersproject/providers'
import type { Web3ReactHooks } from './hooks'
import { Connector } from '@web3-react/types'
import { createContext, useContext } from 'react'
import { getPriorityConnector } from './hooks'

// should this be in the types package?
// types doesn't have the ethersproject/provider dependency however, not sure if installing would polute the types package
export interface Web3ReactValues {
  connector: Connector | undefined
  library: Web3Provider | undefined
  chainId: number | undefined
  account: string | undefined
  active: boolean | undefined
  error: Error | undefined
}

const Web3Context = createContext<Web3ReactValues>({
  connector: undefined,
  chainId: undefined,
  account: undefined,
  active: false,
  error: undefined,
  library: undefined,
})

export function Web3Manager({
  children,
  connectors,
}: {
  children: React.ReactNode
  connectors: [Connector, Web3ReactHooks][]
}) {
  const { usePriorityWeb3React, usePriorityProvider } = getPriorityConnector(...connectors)
  const value = usePriorityWeb3React(usePriorityProvider())

  return <Web3Context.Provider value={value}>{children}</Web3Context.Provider>
}

export function useWeb3React() {
  return useContext(Web3Context)
}
