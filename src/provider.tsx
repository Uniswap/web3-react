import React, { Component, Fragment } from 'react'

import Web3Context from './context'
import useWeb3Manager from './manager'
import { IConnectors, IWeb3ContextInterface, LibraryName } from './types'

interface IWeb3ProviderProps {
  connectors: IConnectors
  libraryName: LibraryName
  children: any
}

function Web3Provider({ connectors, libraryName = 'web3.js', children }: IWeb3ProviderProps) {
  const {
    web3Initialized: active,
    web3State,
    setConnector,
    activateAccount,
    unsetConnector,
    reRenderers
  } = useWeb3Manager(connectors, libraryName)

  const { connectorName, library, networkId, account, error } = web3State

  const context: IWeb3ContextInterface = {
    account,
    activateAccount,
    active,
    error,
    library,
    networkId,
    ...reRenderers,
    connectorName,
    setConnector,
    unsetConnector
  }

  return <Web3Context.Provider value={context}>{children}</Web3Context.Provider>
}

export default Web3Provider

// render props pattern: the consumer is exposed to give access to the web3 context via render props
interface IWeb3ConsumerInterface {
  recreateOnNetworkChange?: boolean
  recreateOnAccountChange?: boolean
  children: any
}

function Web3Consumer({
  recreateOnNetworkChange = true,
  recreateOnAccountChange = true,
  children
}: IWeb3ConsumerInterface) {
  // tslint:disable-next-line: ban-types
  const NetworkWrapper: Function = ({ networkId, networkChildren }: { networkId?: number; networkChildren: any }) =>
    recreateOnNetworkChange && networkId ? (
      <Fragment key={networkId}>{networkChildren}</Fragment>
    ) : (
      <>{networkChildren}</>
    )

  // tslint:disable-next-line: ban-types
  const AccountWrapper: Function = ({ account, accountChildren }: { account?: string | null; accountChildren: any }) =>
    recreateOnAccountChange && account ? <Fragment key={account}>{accountChildren}</Fragment> : <>{accountChildren}</>

  return (
    <Web3Context.Consumer>
      {(context: IWeb3ContextInterface) => (
        <NetworkWrapper networkId={context.networkId}>
          <AccountWrapper account={context.account}>{children(context)}</AccountWrapper>
        </NetworkWrapper>
      )}
    </Web3Context.Consumer>
  )
}

export { Web3Consumer }

// HOC pattern: withWeb3 is an wrapper that gives passed components access to the web3 context
interface IWithWeb3Interface {
  recreateOnNetworkChange?: boolean
  recreateOnAccountChange?: boolean
}

export function withWeb3(
  ComponentToWrap: any,
  { recreateOnNetworkChange = true, recreateOnAccountChange = true }: IWithWeb3Interface = {
    recreateOnAccountChange: true,
    recreateOnNetworkChange: true
  }
): any {
  class WithWeb3 extends Component {
    public render() {
      return (
        <Web3Consumer
          recreateOnNetworkChange={recreateOnNetworkChange}
          recreateOnAccountChange={recreateOnAccountChange}
        >
          {(context: IWeb3ContextInterface) => <ComponentToWrap {...this.props} web3={context} />}
        </Web3Consumer>
      )
    }
  }

  ;(WithWeb3 as any).displayName = `withWeb3(${ComponentToWrap.displayName || ComponentToWrap.name || 'Component'})`

  return WithWeb3
}
