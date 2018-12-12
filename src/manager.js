import { useState, useEffect, useMemo, useRef, useReducer } from 'react'

import { UNSUPPORTED_NETWORK } from './connectors'

const initialWeb3State = {
  library: undefined, networkId: undefined, account: undefined, error: undefined, connectorName: undefined
}

function web3StateReducer (state, action) {
  switch (action.type) {
    case 'INITIALIZE':
      return { ...initialWeb3State, connectorName: action.payload }
    case 'UPDATE_LIBRARY':
      return { ...state, library: action.payload }
    case 'UPDATE_NETWORK_ID':
      return { ...state, networkId: action.payload }
    case 'UPDATE_ACCOUNT':
      return { ...state, account: action.payload }
    case 'UPDATE_ERROR':
      return { ...state, error: action.payload }
    case 'UPDATE_CONNECTOR':
      return { ...initialWeb3State, connectorName: action.payload}
    case 'RESET':
      return initialWeb3State
    default:
      throw Error('No default case.')
  }
}

export default function useWeb3Manager (connectors) {
  // keep track of all connectors that should be tried automatically [] or [connector1, ...]
  const automaticConnectors = useRef(Object.keys(connectors)
    .filter(k => connectors[k].automaticPriority)
    .sort(k => connectors[k].automaticPriority)
  )

  // keep track of which connectors have been tried automatically {} or { connector1: false, ... }
  const automaticState = useRef(automaticConnectors.current.reduce(
    (accumulator, currentValue) => {
      accumulator[currentValue] = false
      return accumulator
    },
    {}
  ))

  // keep track of web3 state
  const [web3State, dispatchWeb3State] = useReducer(
    web3StateReducer, initialWeb3State, { type: 'INITIALIZE', payload: automaticConnectors.current[0] }
  )
  const web3Initialized = useMemo(() => (
    web3State.library &&
    web3State.networkId &&
    web3State.account !== undefined &&
    !web3State.error &&
    web3State.connectorName
  ), [...Object.values(web3State)])

  // flag to keep track of whether any successful initialization has occurred, which invalidates all automatic logic
  const automaticHalted = useRef(false)
  useEffect(
    () => { if (web3Initialized && !automaticHalted.current) automaticHalted.current = true },
    [web3Initialized, automaticHalted.current]
  )

  // flag for whether the automatic phase has passed
  const triedAllAutomatic = automaticHalted.current ||
    automaticConnectors.current.length === 0 ? true : Object.values(automaticState.current).every(x => x)

  // keep track of active connector
  const activeConnector = web3State.connectorName && connectors[web3State.connectorName]

  function setActiveConnector (connectorName) {
    if (!automaticHalted.current) automaticHalted.current = true
    if (!Object.keys(connectors).includes(connectorName))
      throw Error(`Passed 'connectorName' parameter ${connectorName} is not recognized.`)
    dispatchWeb3State({ type: 'UPDATE_CONNECTOR', payload: connectorName })
  }

  function unsetActiveConnector () {
    if (!automaticHalted.current) automaticHalted.current = true
    dispatchWeb3State({ type: 'RESET' })
  }

  function handleError(error) {
    if (!triedAllAutomatic) {
      // if the error is an unsupported network error, throw it
      if (error.code === UNSUPPORTED_NETWORK) {
        automaticHalted.current = true
        dispatchWeb3State({ type: 'UPDATE_ERROR', payload: error })
      }

      // else, figure out what to do
      const indexOfCurrentAutomaticConnector = automaticConnectors.current
        .findIndex(e => e === web3State.connectorName)
      const nextAutomaticCandidate = automaticConnectors.current[indexOfCurrentAutomaticConnector + 1]
      if (nextAutomaticCandidate)
        dispatchWeb3State({ type: 'UPDATE_CONNECTOR', payload: nextAutomaticCandidate })
      else
        dispatchWeb3State({ type: 'RESET' })
    } else {
      if (!automaticHalted.current) automaticHalted.current = true
      dispatchWeb3State({ type: 'UPDATE_ERROR', payload: error })
    }
  }

  // run one-time-per-connector initialization
  useEffect(() => {
    if (web3State.connectorName) {
      automaticState.current = { ...automaticState.current, activeConnectorName: true }
      activeConnector.getLibrary()
        .then(library => dispatchWeb3State({ type: 'UPDATE_LIBRARY', payload: library }))
        .catch(error => handleError(error))
      }
  }, [web3State.connectorName])

  // fetch one-time account and network
  useEffect(() => {
    if (
      web3State.connectorName && web3State.library && !web3State.error &&
      web3State.networkId === undefined && web3State.account === undefined
    ) {
      activeConnector.getNetworkId(web3State.library)
        .then(networkId => {
          if (networkId !== web3State.networkId) dispatchWeb3State({ type: 'UPDATE_NETWORK_ID', payload: networkId })
        })
        .catch(error => handleError(error))

      activeConnector.getAccount(web3State.library)
        .then(account => {
          if (account !== web3State.account) dispatchWeb3State({ type: 'UPDATE_ACCOUNT', payload: account })
        })
        .catch(error => handleError(error))
    }
  }, [web3State.connectorName, web3State.library, web3State.error, web3State.networkId, web3State.account])

  function accountsChangedListenerHandler(accounts) {
    dispatchWeb3State({ type: 'UPDATE_ACCOUNT', payload: accounts[0] })
  }

  function networkChangedListenerHandler(accounts) {
    dispatchWeb3State({ type: 'UPDATE_ACCOUNT', payload: accounts[0] })
  }

  // run network listener
  useEffect(() => {
    if (web3State.connectorName && activeConnector.listenForNetworkChanges && web3State.library && !web3State.error) {
      const { ethereum } = window
      ethereum.on('accountsChanged', accountsChangedListenerHandler)
      return () => ethereum.removeListener('accountsChanged', accountsChangedListenerHandler)
    }
  }, [web3State.connectorName, web3State.library, web3State.error, web3State.networkId])

  // run account listener
  useEffect(() => {
    if (web3State.connectorName && activeConnector.listenForAccountChanges && web3State.library && !web3State.error) {
      const { ethereum } = window
      ethereum.on('networkChanged', networkChangedListenerHandler)
      return () => ethereum.removeListener('networkChanged', networkChangedListenerHandler)
    }
  }, [web3State.connectorName, web3State.library, web3State.error, web3State.account])

  // account reRenderer
  const [accountReRenderer, setAccountReRenderer] = useState(0)
  function forceAccountReRender () {
    setAccountReRenderer(accountReRenderer + 1)
  }

  // network reRenderer
  const [networkReRenderer, setNetworkReRenderer] = useState(0)
  function forceNetworkReRender () {
    setNetworkReRenderer(networkReRenderer + 1)
  }

  const { error: web3Error, ..._web3State } = web3State

  return [
      !triedAllAutomatic, web3Initialized, activeConnector, setActiveConnector, unsetActiveConnector,
      _web3State, web3Error,
      { accountReRenderer, forceAccountReRender, networkReRenderer, forceNetworkReRender }
    ]
}
