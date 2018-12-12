import React, { useRef, Suspense, Component, Fragment } from 'react'
import PropTypes from 'prop-types'

import Web3Context from './context'
import useWeb3Manager from './manager'
import { Connector } from './connectors'

function Web3Provider({ connectors, screens, children }) {
  const allScreens = useRef(Object.keys(defaultScreens).reduce(
    (accumulator, currentValue) => {
      accumulator[currentValue] = screens[currentValue] || defaultScreens[currentValue]
      return accumulator
    },
    {}
  ))
  const { InitializingWeb3, Web3Error } = allScreens.current

  const [
    inAutomaticPhase, web3Initialized, activeConnector, setActiveConnector, unsetActiveConnector,
    web3State, web3Error, reRenderers
  ] = useWeb3Manager(connectors)

  const Body = () => {
    if (web3Error)
      return <Web3Error
        error={web3Error}
        connectors={connectors} currentConnector={activeConnector}
        setConnector={setActiveConnector} unsetConnector={unsetActiveConnector}
      />

    if (!web3Initialized)
      return <InitializingWeb3
        inAutomaticPhase={inAutomaticPhase}
        connectors={connectors} currentConnector={activeConnector}
        setConnector={setActiveConnector} unsetConnector={unsetActiveConnector}
      />

    return (
      <Web3Context.Provider
        value={{
          ...web3State, reRenderers,
          connector: activeConnector, setConnector: setActiveConnector, unsetConnector: unsetActiveConnector
        }}
      >
        {children}
      </Web3Context.Provider>
    )
  }

  return (
    <Suspense fallback={<div />}>
      {Body()}
    </Suspense>
  )
}

const screens = {
  InitializingWeb3: PropTypes.any,
  Web3Error:        PropTypes.any
}

const defaultScreens = {
  InitializingWeb3: React.lazy(() => import('./defaultScreens/InitializingWeb3')),
  Web3Error:        React.lazy(() => import('./defaultScreens/Web3Error'))
}

Web3Provider.propTypes = {
  connectors: PropTypes.objectOf(PropTypes.instanceOf(Connector)).isRequired,
  screens:    PropTypes.shape(screens),
  children:   PropTypes.node.isRequired
}

Web3Provider.defaultProps = {
  screens: defaultScreens
}

export default Web3Provider


// render props pattern: the consumer is exposed to give access to the web3 context via render props
function Web3Consumer (props) {
  const { recreateOnNetworkChange, recreateOnAccountChange, children } = props

  return (
    <Web3Context.Consumer>
      {context => (
        <Fragment key={recreateOnNetworkChange ? context.networkId : undefined}>
          <Fragment key={recreateOnAccountChange ? context.account : undefined}>
            {children(context)}
          </Fragment>
        </Fragment>
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
export function withWeb3(ComponentToWrap, props) {
  const { recreateOnNetworkChange, recreateOnAccountChange } = props || {}

  class WithWeb3 extends Component {
    render() {
      return (
        <Web3Consumer
          recreateOnNetworkChange={recreateOnNetworkChange || true}
          recreateOnAccountChange={recreateOnAccountChange || true}
        >
          {context => <ComponentToWrap {...this.props} web3={context} />}
        </Web3Consumer>
      )
    }
  }

  WithWeb3.displayName = `WithWeb3(${ComponentToWrap.displayName || ComponentToWrap.name || 'Component'})`

  return WithWeb3
}
