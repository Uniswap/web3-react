import React, { useRef, Suspense, Component, Fragment } from 'react'
import PropTypes from 'prop-types'

import Web3Context from './context'
import useWeb3Manager from './manager'
import { Web3ContextInterface, Connectors, LibraryName } from './types'

import Loader from './defaultScreens/loader'

interface Web3ProviderProps {
  connectors: Connectors,
  passive: boolean,
  screens: any,
  libraryName: LibraryName,
  children: any
}
function Web3Provider({ connectors, passive, screens, libraryName, children }: Web3ProviderProps)  {
  const filledScreens: any = useRef(
    Object.keys(defaultScreens).reduce(
      (accumulator: any, currentValue: string) => {
        accumulator[currentValue] = screens[currentValue] || defaultScreens[currentValue]
        return accumulator
      },
      {}
    )
  )
  const { InitializingWeb3, Web3Error } = filledScreens.current

  const {
    web3State, activeConnector,
    inAutomaticPhase, web3Initialized,
    activate, activateAccount,
    setActiveConnector: setConnector, resetConnectors,
    reRenderers
  } = useWeb3Manager(connectors, passive, libraryName)

  const { active, connectorName, error } = web3State

  const Body = () => {
    if (error)
      return <Web3Error
        error={error} connectors={connectors} connectorName={connectorName} connector={activeConnector}
        activate={activate} setConnector={setConnector} resetConnectors={resetConnectors}
      />

    if (inAutomaticPhase)
      return <Loader />

    if (active && !web3Initialized)
      return <InitializingWeb3 connectors={connectors} setConnector={setConnector} resetConnectors={resetConnectors} />

    else {
      const { library, networkId, account } = web3State

      const context: Web3ContextInterface = {
        library, networkId, account,
        ...reRenderers,
        connectorName, activate, activateAccount, setConnector, resetConnectors
      }

      return (
        <Web3Context.Provider value={context}>
          {children}
        </Web3Context.Provider>
      )
    }
  }

  return (
    <Suspense fallback={<Loader />}>
      {Body()}
    </Suspense>
  )
}

const screens = {
  InitializingWeb3: PropTypes.any,
  Web3Error:        PropTypes.any
}

const defaultScreens: any = {
  InitializingWeb3: React.lazy(() => import('./defaultScreens/InitializingWeb3')),
  Web3Error:        React.lazy(() => import('./defaultScreens/Web3Error'))
}

Web3Provider.propTypes = {
  connectors:  PropTypes.objectOf(PropTypes.object).isRequired,
  passive:     PropTypes.bool.isRequired,
  screens:     PropTypes.shape(screens).isRequired,
  libraryName: PropTypes.oneOf(['web3.js', 'ethers.js']).isRequired,
  children:    PropTypes.node.isRequired
}

Web3Provider.defaultProps = {
  passive:     false,
  screens:     defaultScreens,
  libraryName: 'web3.js'
}

export default Web3Provider


// render props pattern: the consumer is exposed to give access to the web3 context via render props
function Web3Consumer (
  { recreateOnNetworkChange = true, recreateOnAccountChange = true, children }:
  { recreateOnNetworkChange: boolean, recreateOnAccountChange: boolean, children: any }
) {
  const NetworkWrapper: any = ({ networkId, children }: { networkId?: number, children: any }) => (
    (recreateOnNetworkChange && networkId) ?
      <Fragment key={networkId}>{children}</Fragment> :
      <>{children}</>
    )

  const AccountWrapper: any = ({ account, children }: { account?: string | null, children: any }) => (
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

Web3Consumer.propTypes = {
  recreateOnNetworkChange: PropTypes.bool,
  recreateOnAccountChange: PropTypes.bool,
  children:                PropTypes.func.isRequired
}

Web3Consumer.defaultProps = {
  recreateOnAccountChange: true,
  recreateOnNetworkChange: true
}

export { Web3Consumer }


// HOC pattern: withWeb3 is an wrapper that gives passed components access to the web3 context
export function withWeb3(ComponentToWrap: any, { recreateOnNetworkChange = true, recreateOnAccountChange = true } = {}): any {
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
