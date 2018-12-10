import React, { useState, Suspense, Component, Fragment } from 'react'
import PropTypes from 'prop-types'

import Web3Context from './context'
import useWeb3Manager from './manager'
import { Connector } from './connectors'

// if (web3Error.code === MANAGER_ERROR_CODES.ETHEREUM_ACCESS_DENIED)
//   return <PermissionNeeded />
// else if (web3Error.code === MANAGER_ERROR_CODES.NO_WEB3)
//   return <NoWeb3 />
// if (!supportedNetworks.includes(web3State.networkId))
//   return <UnsupportedNetwork supportedNetworkIds={supportedNetworks} />
// if (accountRequired && !usingProviderURL && web3State.account === null)
//   return <UnlockNeeded />


function Web3Provider({ connectors, screens, children }) {
  for (let defaultScreen of Object.keys(defaultScreens))
    screens[defaultScreen] = screens[defaultScreen] || defaultScreens[defaultScreen]
  const { InitializingWeb3, Web3Error } = screens

  const [currentConnector, _setCurrentConnector] = useState(null)
  function setCurrentConnector(i) {
    _setCurrentConnector(connectors[i])
  }

  const [web3State, web3Initialized, web3Error, reRenderers] = useWeb3Manager(currentConnector)

  const Body = () => {
    if (web3Error)
      return <Web3Error error={web3Error} connector={currentConnector} setCurrentConnector={setCurrentConnector} />

    if (!web3Initialized)
      return <InitializingWeb3 connector={currentConnector} setCurrentConnector={setCurrentConnector} />

    return (
      <Web3Context.Provider
        value={{ ...web3State, reRenderers: reRenderers, setCurrentConnector: setCurrentConnector }}
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
  connectors: PropTypes.arrayOf(PropTypes.instanceOf(Connector)).isRequired,
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
