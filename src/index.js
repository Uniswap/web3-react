import React, { Component, Fragment, useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import Web3 from 'web3'

import { useThrottled } from './utilities'
import * as utilities from './web3Utilities'
import { Initializing, NoWeb3, PermissionNeeded, UnlockNeeded, UnsupportedNetwork, Web3Error } from './defaultScreens'

import * as hooks from './web3Hooks'
export { hooks }

const deniedAccessErrorName = 'EthereumAccountAccessDenied'


class Web3ReactErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { error: undefined }
  }

  static getDerivedStateFromError(error) {
    return { error: error }
  }

  componentDidCatch(error, info) {
    console.log(info)    // eslint-disable-line no-console
    console.error(error) // eslint-disable-line no-console
  }

  render() {
    const { ErrorScreen, children } = this.props

    if (this.state.error) {
      return <ErrorScreen error={this.state.error} />
    }

    return children
  }
}

Web3ReactErrorBoundary.propTypes = {
  children:    PropTypes.node.isRequired,
  ErrorScreen: PropTypes.any.isRequired
}


export const Web3Context = React.createContext()


function useWeb3Manager (pollTime) {
  const [web3Error, setWeb3Error] = useState(undefined)
  const [web3Initialized, setWeb3Initialized] = useState(false)

  const [accountRerender, setAccountRerender] = useState(0)
  function forceAccountRerender () {
    setAccountRerender(accountRerender + 1)
  }

  const initialWeb3State = { web3js: undefined, account: undefined, networkId: undefined, utilities: {} }
  const [web3State, setWeb3State] = useState(initialWeb3State)
  function setWeb3StateIndividually (newState) {
    setWeb3State({...initialWeb3State, ...web3State, ...newState})
  }

  // run one-time initialization effect
  useEffect(async () => {
    const { web3, ethereum } = window // eslint-disable-line no-undef

    // initialize web3js
    let web3js
    let web3Error
    // for modern dapp browsers
    if (ethereum)
      await ethereum.enable()
        .then(() => {
          web3js = new Web3(ethereum)
        })
        .catch(error => {
          const deniedAccessError = Error(error.toString())
          deniedAccessError.name = deniedAccessErrorName
          web3Error = deniedAccessError
        })
    // for legacy dapp browsers
    else if (web3 && web3.currentProvider)
      web3js = new Web3(web3.currentProvider)
    // no web3 detected
    else
      web3Error = Error('noWeb3')

    if (web3Error)
      setWeb3Error(web3Error)
    else {
      const {
        setEthereumVariables, // eslint-disable-line no-unused-vars
        ...utilitiesToInject
      } = utilities

      setWeb3StateIndividually({web3js: web3js, utilities: utilitiesToInject})
    }
  }, [])

  // initialize polling for network and account changes
  function web3Poll () {
    if (web3State.web3js) {
      const networkPromise = () => web3State.web3js.eth.net.getId()
        .then(networkId => {
          if (networkId !== web3State.networkId) setWeb3StateIndividually({networkId: networkId})
        })

      const accountPromise = () => web3State.web3js.eth.getAccounts()
        .then(accounts => {
          const account = (accounts === undefined || accounts[0] === undefined) ? null : accounts[0]
          if (account !== web3State.account) setWeb3StateIndividually({account: account})
        })

      if (!web3Initialized && web3State.account !== undefined && web3State.networkId)
        setWeb3Initialized(true)

      Promise.all([networkPromise(), accountPromise()])
        .catch(error => setWeb3Error(error))
    }
  }
  const throttledWeb3Poll = useThrottled(web3Poll, pollTime)

  useEffect(() => {
    throttledWeb3Poll()
    const pollInterval = setInterval(throttledWeb3Poll, pollTime)
    return () => clearInterval(pollInterval)
  })

  // set ethereum variables
  useEffect(() => {
    utilities.setEthereumVariables({
      web3js:    web3State.web3js,
      account:   web3State.account,
      networkId: web3State.networkId
    })
  }, [web3State.web3js, web3State.account, web3State.networkId])

  return [web3State, web3Initialized, web3Error, { accountRerender, forceAccountRerender }]
}

function Web3Provider(props) {
  const { screens, pollTime, supportedNetworks, children } = props
  const { Web3Error, Initializing, UnsupportedNetwork, PermissionNeeded, UnlockNeeded } = screens

  const [web3State, web3Initialized, web3Error, { accountRerender, forceAccountRerender }] = useWeb3Manager(pollTime)

  if (web3Error) {
    if (web3Error.name === deniedAccessErrorName)
      return <PermissionNeeded />
    return <Web3Error error={web3Error} />
  }

  if (!web3Initialized) {
    return <Initializing />
  }

  if (!supportedNetworks.includes(web3State.networkId)) {
    const supportedNetworkNames = supportedNetworks.map(id => web3State.utilities.getNetworkName(id))
    return <UnsupportedNetwork supportedNetworkNames={supportedNetworkNames} />
  }

  if (web3State.account === null) {
    return <UnlockNeeded />
  }

  return (
    <Web3ReactErrorBoundary ErrorScreen={Web3Error}>
      <Web3Context.Provider value={{...web3State, accountRerender, forceAccountRerender}}>
        {children}
      </Web3Context.Provider>
    </Web3ReactErrorBoundary>
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
  Initializing:       Initializing,
  NoWeb3:             NoWeb3,
  PermissionNeeded:   PermissionNeeded,
  UnlockNeeded:       UnlockNeeded,
  UnsupportedNetwork: UnsupportedNetwork,
  Web3Error:          Web3Error
}

Web3Provider.propTypes = {
  screens:           PropTypes.shape(screens),
  pollTime:          PropTypes.number,
  supportedNetworks: PropTypes.arrayOf(PropTypes.number),
  children:          PropTypes.node
}

Web3Provider.defaultProps = {
  screens:           defaultScreens,
  pollTime:          1000,
  supportedNetworks: [1, 3, 4, 42],
  children:          ''
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
export function withWeb3(ComponentToWrap) {
  class WithWeb3 extends Component {
    render() {
      return (
        <Web3Consumer>
          {context => <ComponentToWrap {...this.props} w3w={context} />}
        </Web3Consumer>
      )
    }
  }

  WithWeb3.displayName = `WithWeb3(${ComponentToWrap.displayName || ComponentToWrap.name || 'Component'})`

  return WithWeb3
}
