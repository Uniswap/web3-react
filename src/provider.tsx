import React, { Component, Fragment, useContext } from 'react'
import { ethers } from 'ethers'

import _Web3Context, { Library, Web3Context } from './context'
import useWeb3Manager from './manager'

export interface Connectors {
  [propName: string]: any
}

export type LibraryName = 'web3.js' | 'ethers.js' | null

export function useWeb3Context(): Web3Context {
  return useContext(_Web3Context)
}

interface Web3ProviderProps {
  connectors: Connectors
  libraryName?: LibraryName | null | ((provider: any) => any)
  web3Api?: any
  children: any
}

function Web3Provider({ connectors, libraryName, web3Api: Web3, children }: Web3ProviderProps): any {
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
    ((): Library => {
      if (ethers.providers.Provider.isProvider(provider)) {
        return provider
      } else {
        switch (libraryName) {
          case 'ethers.js':
            return new ethers.providers.Web3Provider(provider)
          case 'web3.js':
            return new Web3(provider)
          case undefined:
          case null:
            return provider
          default:
            return libraryName(provider)
        }
      }
    })()

  const context: Web3Context = {
    active,
    connectorName,
    connector,
    library: providerToInject,
    networkId,
    account,
    error,

    setConnector,
    setFirstValidConnector,
    unsetConnector,
    setError
  }

  return <_Web3Context.Provider value={context}>{children}</_Web3Context.Provider>
}

export default Web3Provider

// render props pattern: the consumer is exposed to give access to the web3 context via render props
interface Web3ConsumerProps {
  recreateOnNetworkChange?: boolean
  recreateOnAccountChange?: boolean
  children: any
}

function Web3Consumer({
  recreateOnNetworkChange = true,
  recreateOnAccountChange = true,
  children
}: Web3ConsumerProps): any {
  return (
    <_Web3Context.Consumer>
      {(context: Web3Context): any => (
        <Fragment key={(recreateOnNetworkChange && context.networkId) || undefined}>
          <Fragment key={(recreateOnAccountChange && context.account) || undefined}>{children(context)}</Fragment>
        </Fragment>
      )}
    </_Web3Context.Consumer>
  )
}

export { Web3Consumer }

// HOC pattern: withWeb3 is an wrapper that gives passed components access to the web3 context
interface WithWeb3Props {
  recreateOnNetworkChange?: boolean
  recreateOnAccountChange?: boolean
}

export function withWeb3(
  ComponentToWrap: any,
  { recreateOnNetworkChange = true, recreateOnAccountChange = true }: WithWeb3Props = {}
): any {
  class WithWeb3 extends Component {
    public render(): any {
      return (
        <Web3Consumer
          recreateOnNetworkChange={recreateOnNetworkChange}
          recreateOnAccountChange={recreateOnAccountChange}
        >
          {(context: Web3Context): any => <ComponentToWrap {...this.props} web3={context} />}
        </Web3Consumer>
      )
    }
  }

  ;(WithWeb3 as any).displayName = `withWeb3(${ComponentToWrap.displayName || ComponentToWrap.name || 'Component'})`

  return WithWeb3
}
