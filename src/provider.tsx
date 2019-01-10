import React, { Component, Fragment } from 'react'

import Web3Context from './context'
import useWeb3Manager from './manager'
import { Web3ContextInterface, Connectors, LibraryName } from './types'

interface Web3ProviderProps {
  connectors : Connectors,
  libraryName: LibraryName,
  children   : any
}

function Web3Provider({ connectors, libraryName, children }: Web3ProviderProps)  {
  const {
    web3Initialized: active, web3State,
    setConnector, activateAccount, unsetConnector,
    reRenderers
  } = useWeb3Manager(connectors, libraryName)

  const { connectorName, library, networkId, account, error } = web3State

  const context: Web3ContextInterface = {
    library, networkId, account, error,
    ...reRenderers,
    active, connectorName, setConnector, activateAccount, unsetConnector
  }

  return (
    <Web3Context.Provider value={context}>
      {children}
    </Web3Context.Provider>
  )
}

export default Web3Provider


// render props pattern: the consumer is exposed to give access to the web3 context via render props
interface Web3ConsumerInterface {
  recreateOnNetworkChange: boolean
  recreateOnAccountChange: boolean
  children: any
}
function Web3Consumer (
  { recreateOnNetworkChange = true, recreateOnAccountChange = true, children }: Web3ConsumerInterface
) {
  const NetworkWrapper: Function = ({ networkId, children }: { networkId?: number, children: any }) => (
    (recreateOnNetworkChange && networkId) ?
      <Fragment key={networkId}>{children}</Fragment> :
      <>{children}</>
    )

  const AccountWrapper: Function = ({ account, children }: { account?: string | null, children: any }) => (
    (recreateOnAccountChange && account) ?
      <Fragment key={account}>{children}</Fragment> :
      <>{children}</>
    )

  return (
    <Web3Context.Consumer>
      {(context: Web3ContextInterface) => (
        <NetworkWrapper networkId={context.networkId}>
          <AccountWrapper account={context.account}>
            {children(context)}
          </AccountWrapper>
        </NetworkWrapper>
      )}
    </Web3Context.Consumer>
  )
}

export { Web3Consumer }


// HOC pattern: withWeb3 is an wrapper that gives passed components access to the web3 context
export function withWeb3(
  ComponentToWrap: any, { recreateOnNetworkChange = true, recreateOnAccountChange = true } = {}
): any {
  class WithWeb3 extends Component {
    render() {
      return (
        <Web3Consumer
          recreateOnNetworkChange={recreateOnNetworkChange}
          recreateOnAccountChange={recreateOnAccountChange}
        >
          {(context: Web3ContextInterface) => <ComponentToWrap {...this.props} web3={context} />}
        </Web3Consumer>
      )
    }
  }

  (WithWeb3 as any).displayName = `withWeb3(${ComponentToWrap.displayName || ComponentToWrap.name || 'Component'})`

  return WithWeb3
}
