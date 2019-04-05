import React, { Component, Fragment, useContext } from 'react'

import Web3Context from './context'
import useWeb3Manager from './manager'
import { IConnectors, IWeb3ContextInterface, LibraryName } from './types'

interface IWeb3ProviderProps {
  connectors: IConnectors
  libraryName?: LibraryName
  children: any
}

import { ethers } from 'ethers'
import Web3 from 'web3'

import * as Connectors from './connectors'
export { Connectors }

export function useWeb3Context(): IWeb3ContextInterface {
  return useContext(Web3Context)
}

function Web3Provider({ connectors, libraryName = 'web3.js', children }: IWeb3ProviderProps) {
  const {
    web3Initialized: active,
    web3State,
    connector,
    setConnector,
    setFirstValidConnector,
    unsetConnector,
    setError
  } = useWeb3Manager(connectors)

  const { connectorName, provider, networkId, account, error } = web3State

  const providerToInject =
    provider &&
    (() => {
      switch (libraryName) {
        case 'ethers.js':
          return new ethers.providers.Web3Provider(provider)
        case 'web3.js':
          return new Web3(provider)
        case null:
          return provider
      }
    })()

  const context: IWeb3ContextInterface = {
    active,
    connectorName,
    connector, // tslint:disable-line: object-literal-sort-keys
    library: providerToInject,
    networkId,
    account,
    error,

    setConnector,
    setFirstValidConnector,
    unsetConnector,
    setError
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
  return (
    <Web3Context.Consumer>
      {(context: IWeb3ContextInterface) => (
        <Fragment key={(recreateOnNetworkChange && context.networkId) || undefined}>
          <Fragment key={(recreateOnAccountChange && context.account) || undefined}>{children(context)}</Fragment>
        </Fragment>
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
  { recreateOnNetworkChange = true, recreateOnAccountChange = true }: IWithWeb3Interface
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
