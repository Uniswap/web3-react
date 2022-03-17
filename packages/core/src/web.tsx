import React from 'react'

import type { Web3ReactHooks, Web3ReactHookValues } from './hooks'
import { Connector } from '@web3-react/types'
import { getPriorityConnector } from './hooks'

const Web3Context = React.createContext({
  // connector: null,
  chainId: 0,
  // account: '',
  // active: false,
  // error: null,
  // library: null,
})

export function Web3ReactProvider({
  children,
  connectors,
}: {
  children: React.ReactNode
  connectors: [Connector, Web3ReactHooks][]
}) {
  // console.log({ connectors })
  // const { usePriorityWeb3React, usePriorityProvider } = getPriorityConnector(...connectors)
  // const value = usePriorityWeb3React(usePriorityProvider())

  // console.log('here2', value)

  return <Web3Context.Provider value={{ chainId: 4 }}>{children}</Web3Context.Provider>
  // return <div>{children}</div>
}

export function useWeb3React() {
  const web3 = React.useContext(Web3Context)
  if (!web3) throw `Web3React hooks can only be used within the Web3ReactProvider component!`
  return web3
}

export function Test({ children }: { children: React.ReactNode }) {
  return <div style={{ backgroundColor: 'blue' }}>{children}</div>
}
