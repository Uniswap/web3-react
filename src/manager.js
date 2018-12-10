import { useState, useEffect, useReducer } from 'react'

const initialWeb3State = {
  library: undefined,
  networkId: undefined, account: undefined,
  error: undefined
}

function web3StateReducer (state, action) {
  switch (action.type) {
    case 'UPDATE_LIBRARY':
      return { ...state, library: action.payload }
    case 'UPDATE_NETWORK_ID':
      return { ...state, networkId: action.payload }
    case 'UPDATE_ACCOUNT':
      return { ...state, account: action.payload }
    case 'UPDATE_ERROR':
      return { ...state, error: action.payload }
    default:
      return initialWeb3State
  }
}

function updateNetwork (connector, web3State, dispatchWeb3State) {
  connector.getNetworkId(web3State.library)
    .then(networkId => {
      if (networkId !== web3State.networkId) dispatchWeb3State({ type: 'UPDATE_NETWORK_ID', payload: networkId })
    })
    .catch(error => dispatchWeb3State({ type: 'UPDATE_ERROR', payload: error }))
}

function updateAccount (connector, web3State, dispatchWeb3State) {
  connector.getAccount(web3State.library)
    .then(account => {
      if (account !== web3State.account) dispatchWeb3State({ type: 'UPDATE_ACCOUNT', payload: account })
    })
    .catch(error => dispatchWeb3State({ type: 'UPDATE_ERROR', payload: error }))
}

function isWeb3StateActive(web3State) {
  return (
    web3State.library &&
    web3State.networkId && web3State.account !== undefined &&
    !web3State.error
  )
}

export default function useWeb3Manager (connector) {
  const [web3State, dispatchWeb3State] = useReducer(web3StateReducer, initialWeb3State)

  const web3Initialized = isWeb3StateActive(web3State)

  // run one-time-per-connector initialization
  useEffect(() => {
    dispatchWeb3State({ type: 'RESET' })
    if (connector)
      connector.getLibrary()
        .then(library => dispatchWeb3State({ type: 'UPDATE_LIBRARY', payload: library }))
        .catch(error => dispatchWeb3State({ type: 'UPDATE_ERROR', payload: error }))
  }, [connector])

  // run network update/poll
  useEffect(() => {
    if (connector && web3State.library && !web3State.error) {
      updateNetwork(connector, web3State, dispatchWeb3State)
      if (connector.pollForNetworkChanges) {
        const networkPollInterval = setInterval(
          () => updateNetwork(connector, web3State, dispatchWeb3State), connector.networkPollInterval
        )
        return () => clearInterval(networkPollInterval)
      }
    }
  }, [connector, web3State.library, web3State.error, web3State.networkId])

  // run account update/poll
  useEffect(() => {
    if (connector && web3State.library && !web3State.error) {
      updateAccount(connector, web3State, dispatchWeb3State)
      if (connector.pollForAccountChanges) {
        const accountPollInterval = setInterval(
          () => updateAccount(connector, web3State, dispatchWeb3State), connector.accountPollInterval
        )
        return () => clearInterval(accountPollInterval)
      }
    }
  }, [connector, web3State.library, web3State.error, web3State.account])

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
  const { error: initialWeb3Error, ..._initialWeb3State } = initialWeb3State

  return connector ?
    [
      _web3State, web3Initialized, web3Error,
      { accountReRenderer, forceAccountReRender, networkReRenderer, forceNetworkReRender }
    ] :
    [
      _initialWeb3State, false, initialWeb3Error,
      { accountReRenderer, forceAccountReRender, networkReRenderer, forceNetworkReRender }
    ]
}
