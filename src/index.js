import React, { Suspense, Component, Fragment, useState, useEffect, useReducer } from 'react'
import PropTypes from 'prop-types'
import Web3 from 'web3'

import Web3Context from './Web3Context'


// define custom error codes
const ETHEREUM_ACCESS_DENIED = 'ETHEREUM_ACCESS_DENIED'
const NO_WEB3 = 'NO_WEB3'


// web3 manager
const initialWeb3State = { web3js: undefined, account: undefined, networkId: undefined, usingProviderURL: undefined }

function web3StateReducer (state, action) {
  switch (action.type) {
    case 'INITIALIZE':
      return { ...state, web3js: action.payload, usingProviderURL: false }
    case 'INITIALIZE_URL':
      return { ...state, web3js: action.payload, usingProviderURL: true }
    case 'UPDATE_NETWORK_ID':
      return { ...state, networkId: action.payload }
    case 'UPDATE_ACCOUNT':
      return { ...state, account: action.payload }
    default:
      return initialWeb3State
  }
}

function useWeb3Manager (pollTime, providerURL) {
  const [web3State, dispatchWeb3State] = useReducer(web3StateReducer, initialWeb3State)

  // compute initialization status
  const web3Initialized = web3State.web3js && web3State.account !== undefined && web3State.networkId

  // web3 error ref
  const [web3Error, setWeb3Error] = useState(null)
  useEffect(() => {
    if (web3Initialized && web3Error) setWeb3Error(null)
  })

  // run one-time initialization
  useEffect(() => {
    const { web3, ethereum } = window

    // for modern dapp browsers
    if (ethereum)
      ethereum.enable()
        .then(() => {
          const web3js = new Web3(ethereum)
          dispatchWeb3State({ type: 'INITIALIZE', payload: web3js })
        })
        .catch(deniedAccessMessage => {
          const deniedAccessError = Error(deniedAccessMessage.toString())
          deniedAccessError.code = ETHEREUM_ACCESS_DENIED
          setWeb3Error(deniedAccessError)
        })
    // for legacy dapp browsers
    else if (web3 && web3.currentProvider) {
      const web3js = new Web3(web3.currentProvider)
      dispatchWeb3State({ type: 'INITIALIZE', payload: web3js })
    }
    // use providerURL as a backup
    else if (providerURL) {
      const web3js = new Web3(providerURL)
      dispatchWeb3State({ type: 'INITIALIZE_URL', payload: web3js })
    }
    // no web3 detected
    else {
      const noWeb3Error = Error('No Web3 Provider Detected.')
      noWeb3Error.code = NO_WEB3
      setWeb3Error(noWeb3Error)
    }
  }, [])

  function networkPoll () {
    web3State.web3js.eth.net.getId()
      .then(networkId => {
        if (networkId !== web3State.networkId) dispatchWeb3State({ type: 'UPDATE_NETWORK_ID', payload: networkId })
      })
      .catch(error => setWeb3Error(error))
  }

  function accountPoll () {
    web3State.web3js.eth.getAccounts()
      .then(accounts => {
        const account = (accounts === undefined || accounts[0] === undefined) ? null : accounts[0]
        if (account !== web3State.account) dispatchWeb3State({ type: 'UPDATE_ACCOUNT', payload: account })
      })
      .catch(error => setWeb3Error(error))
  }

  useEffect(() => {
    if (web3State.web3js) {
      networkPoll()
      const networkPollInterval = setInterval(networkPoll, pollTime)
      return () => clearInterval(networkPollInterval)
    }
  }, [web3State.web3js, web3State.networkId])

  useEffect(() => {
    if (web3State.web3js) {
      accountPoll()
      const accountPollInterval = setInterval(accountPoll, pollTime)
      return () => clearInterval(accountPollInterval)
    }
  }, [web3State.web3js, web3State.account])

  // reRenderers
  const [accountReRenderer, setAccountReRenderer] = useState(0)
  function forceAccountReRender () {
    setAccountReRenderer(accountReRenderer + 1)
  }
  const [networkReRenderer, setNetworkReRenderer] = useState(0)
  function forceNetworkReRender () {
    setNetworkReRenderer(networkReRenderer + 1)
  }

  const { usingProviderURL, ...rest } = web3State

  return [
    rest, web3Initialized, usingProviderURL, web3Error,
    { accountReRenderer, forceAccountReRender, networkReRenderer, forceNetworkReRender }
  ]
}


function Web3Provider({ screens, providerURL, pollTime, supportedNetworks, accountRequired, children }) {
  for (let defaultScreen of Object.keys(defaultScreens)) {
    screens[defaultScreen] = screens[defaultScreen] || defaultScreens[defaultScreen]
  }
  const { Initializing, NoWeb3, PermissionNeeded, UnlockNeeded, UnsupportedNetwork, Web3Error } = screens

  const [web3State, web3Initialized, usingProviderURL, web3Error, reRenderers] = useWeb3Manager(pollTime, providerURL)

  const Body = () => {
    if (web3Error) {
      if (web3Error.code === ETHEREUM_ACCESS_DENIED)
        return <PermissionNeeded />
      else if (web3Error.code === NO_WEB3)
        return <NoWeb3 />
      else
        return <Web3Error error={web3Error} />
    }

    if (!web3Initialized)
      return <Initializing />

    if (!supportedNetworks.includes(web3State.networkId))
      return <UnsupportedNetwork supportedNetworkIds={supportedNetworks} />

    if (accountRequired && !usingProviderURL && web3State.account === null)
      return <UnlockNeeded />

    return (
      <Web3Context.Provider value={{...web3State, reRenderers: reRenderers}}>
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
  Initializing:       PropTypes.any,
  NoWeb3:             PropTypes.any,
  PermissionNeeded:   PropTypes.any,
  UnlockNeeded:       PropTypes.any,
  UnsupportedNetwork: PropTypes.any,
  Web3Error:          PropTypes.any
}

const defaultScreens = {
  Initializing:       React.lazy(() => import('./defaultScreens/Initializing')),
  NoWeb3:             React.lazy(() => import('./defaultScreens/NoWeb3')),
  PermissionNeeded:   React.lazy(() => import('./defaultScreens/PermissionNeeded')),
  UnlockNeeded:       React.lazy(() => import('./defaultScreens/UnlockNeeded')),
  UnsupportedNetwork: React.lazy(() => import('./defaultScreens/UnsupportedNetwork')),
  Web3Error:          React.lazy(() => import('./defaultScreens/Web3Error'))
}

Web3Provider.propTypes = {
  screens:           PropTypes.shape(screens),
  providerURL:       PropTypes.string,
  pollTime:          PropTypes.number,
  supportedNetworks: PropTypes.arrayOf(PropTypes.number),
  accountRequired:   PropTypes.bool,
  children:          PropTypes.node
}

Web3Provider.defaultProps = {
  screens:           defaultScreens,
  pollTime:          1000,
  supportedNetworks: [1, 3, 4, 42],
  accountRequired:   true
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
