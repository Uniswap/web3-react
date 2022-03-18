import React from 'react'

import type { Web3ReactHooks, Web3ReactHookValues } from './hooks'
import { Connector } from '@web3-react/types'
import { getPriorityConnector } from './hooks'

// const Web3Context = React.createContext<Web3ReactHookValues>({
//   connector: null,
//   account: '',
//   active: false,
//   error: null,
//   library: null,
//   chainId: null,
// })

// const Web3Context = React.createContext<Web3ReactHookValues>(null)

// export function Web3ReactProvider({
//   children,
//   connectors,
// }: {
//   children: React.ReactNode
//   connectors: [Connector, Web3ReactHooks][]
// }) {
//   const { usePriorityWeb3React, usePriorityProvider } = getPriorityConnector(...connectors)
//   const web3 = usePriorityWeb3React(usePriorityProvider())
//   return <Web3Context.Provider value={web3}>{children}</Web3Context.Provider>
// }

// export function useWeb3React() {
//   const web3 = React.useContext(Web3Context)
//   if (!web3) throw `Web3React hooks can only be used within the Web3ReactProvider component!`
//   return web3
// }

export const ContextTest = React.createContext({ chainId: 100 })

export const ContextTestProv = (props: any) => <ContextTest.Provider value={{ chainId: 200 }} {...props} />
export const useContextTest = () => React.useContext(ContextTest)

function Test() {
  return React.createElement(ContextTestProv, null, React.createElement(ContextTestProv, null))
}