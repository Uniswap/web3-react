import { useState, useEffect, useRef, useReducer } from 'react'

import { Connector } from './connectors'
import { Connectors, Library, LibraryName } from './web3-react'

const initialWeb3State = {
  active: undefined, connectorName: undefined,
  library: undefined, networkId: undefined, account: undefined, error: undefined
}

function web3StateReducer (state: any, action: any) {
  switch (action.type) {
    case 'SETUP': {
      const { active, connectorName } = action.payload
      return { ...initialWeb3State, active, connectorName }
    }
    case 'ACTIVATE':
      return { ...initialWeb3State, active: true, connectorName: action.payload }
    case 'UPDATE_CONNECTOR_NAME':
      return { ...initialWeb3State, active: true, connectorName: action.payload}
    case 'UPDATE_CONNECTOR_VALUES': {
      const { library, networkId, account } = action.payload
      return { active: true, connectorName: state.connectorName, library, networkId, account, error: null  }
    }
    case 'UPDATE_NETWORK_ID':
      return { ...state, networkId: action.payload }
    case 'UPDATE_ACCOUNT':
      return { ...state, account: action.payload }
    case 'UPDATE_ERROR':
      return { ...state, error: action.payload }
    case 'RESET':
      return { ...initialWeb3State, active: action.payload }
    default:
      throw Error('No default case.')
  }
}

interface ConnectorAutomaticState {
  [propName: string]: boolean
}

export default function useWeb3Manager (connectors: Connectors, passive: boolean, libraryName: LibraryName) {
  // keep track of all connectors that should be tried automatically. [] or [connectorName, ...]
  const automaticConnectors = useRef(
    Object.keys(connectors)
      .filter(k => connectors[k].automaticPriority)
      .sort(k => connectors[k].automaticPriority || 0)
  )

  // keep track of which connectors have been tried automatically. {} or { connectorName: false, ... }
  const initialAutomaticState = useRef(
    automaticConnectors.current.reduce(
      (accumulator: any, currentValue: string) => {
        accumulator[currentValue] = false
        return accumulator
      },
      {}
    )
  )
  const automaticState: React.MutableRefObject<ConnectorAutomaticState> = useRef(initialAutomaticState.current)

  // function to activate the manager
  function activate () {
    if (web3State.active) {
      // eslint-disable-next-line no-console
      console.error('Calling activate while in an already-activated state is a no-op.')
      return
    }

    if (automaticHalted.current) automaticHalted.current = false
    if (Object.keys(automaticState.current).map(k => automaticState.current[k]).some((x: any) => x))
      automaticState.current = initialAutomaticState.current
    dispatchWeb3State({ type: 'ACTIVATE', payload: automaticConnectors.current[0] })
  }

  // keep track of web3 state
  const [web3State, dispatchWeb3State] = useReducer(
    web3StateReducer,
    initialWeb3State,
    {
      type: 'SETUP',
      payload: { active: !passive, connectorName: passive ? undefined : automaticConnectors.current[0] } }
  )
  const web3Initialized = (
    web3State.active &&
    web3State.connectorName &&
    web3State.library &&
    web3State.networkId &&
    web3State.account !== undefined &&
    !web3State.error
  )

  // keep track of active connector
  const activeConnector = web3State.connectorName ? connectors[web3State.connectorName] : null

  // flag to keep track of whether any successful initialization has occurred, which invalidates all automatic logic
  const automaticHalted = useRef(false)
  useEffect(() => {
    if (web3Initialized && !automaticHalted.current) automaticHalted.current = true
  }, [web3Initialized, automaticHalted.current])

  // flag for whether the automatic phase is active
  const inAutomaticPhase = !(
    automaticHalted.current ||
    automaticConnectors.current.length === 0 ? true :
      Object.keys(automaticState.current).every(x => automaticState.current[x])
  )

  function setActiveConnector (connectorName: string, skipSettingAutomaticHalted: boolean = false) {
    if (!skipSettingAutomaticHalted && !automaticHalted.current) automaticHalted.current = true
    if (!Object.keys(connectors).includes(connectorName))
      throw Error(`Passed 'connectorName' parameter ${connectorName} is not recognized.`)
    if (connectorName === web3State.connectorName) {
      console.error('Calling setActiveConnector for the currently initialized connector is a no-op.')
      return
    }

    dispatchWeb3State({ type: 'UPDATE_CONNECTOR_NAME', payload: connectorName })
  }

  function unsetActiveConnector (deactivate: boolean = true, skipSettingAutomaticHalted: boolean = false) {
    if (!skipSettingAutomaticHalted && !automaticHalted.current) automaticHalted.current = true
    dispatchWeb3State({ type: 'RESET', payload: !deactivate })
  }

  function handleError(error: Error) {
    if (inAutomaticPhase) {
      // if the error is an unsupported network error, throw it
      if (error.code === Connector.errorCodes.UNSUPPORTED_NETWORK) {
        if (!automaticHalted.current) automaticHalted.current = true
        dispatchWeb3State({ type: 'UPDATE_ERROR', payload: error })
      }

      // else, figure out what to do
      const indexOfCurrentAutomaticConnector = automaticConnectors.current
        .findIndex(e => e === web3State.connectorName)
      const nextAutomaticCandidate = automaticConnectors.current[indexOfCurrentAutomaticConnector + 1]
      if (nextAutomaticCandidate)
        setActiveConnector(nextAutomaticCandidate, true)
      else
        unsetActiveConnector(false, true)
    } else {
      if (!automaticHalted.current) automaticHalted.current = true
      dispatchWeb3State({ type: 'UPDATE_ERROR', payload: error })
    }
  }

  // run one-time-per-connector initialization
  async function initializeConnectorValues () {
    if (!activeConnector) throw Error('No active connector')

    return activeConnector.getLibrary(libraryName)
      .then(async (library: Library) => {
        const networkIdPromise = () => activeConnector.getNetworkId(library)
        const accountPromise = activeConnector.activateAccountAutomatically ?
          () => activeConnector.getAccount(library) :
          () => null

        return Promise.all([networkIdPromise(), accountPromise()])
          .then(([networkId, account]) => {
            dispatchWeb3State({ type: 'UPDATE_CONNECTOR_VALUES', payload: { library, networkId, account } })
          })
      })
  }

  useEffect(() => {
    if (web3State.connectorName) {
      if (!automaticHalted.current) automaticState.current = { ...automaticState.current, activeConnectorName: true }
      if (activeConnector) {
        activeConnector.onActivation()
          .then(() => initializeConnectorValues())
          .catch(error => handleError(error))

        return () => activeConnector.onDeactivation()
      }
    }
  }, [web3State.connectorName])

  // change listeners
  function networkChangedListenerHandler(networkId: number) {
    dispatchWeb3State({ type: 'UPDATE_NETWORK_ID', payload: networkId })
  }

  function accountsChangedListenerHandler(accounts: string[]) {
    dispatchWeb3State({ type: 'UPDATE_ACCOUNT', payload: accounts[0] })
  }

  useEffect(() => {
    if (web3Initialized && activeConnector && activeConnector.listenForNetworkChanges) {
      const { ethereum } = window
      if (ethereum && ethereum.on && ethereum.removeListener) {
        ethereum.on('networkChanged', networkChangedListenerHandler)
        return () => ethereum.removeListener('networkChanged', networkChangedListenerHandler)
      }
    }
  }, [web3Initialized, web3State.connectorName])

  // run account listener
  useEffect(() => {
    if (web3Initialized && activeConnector && activeConnector.listenForAccountChanges) {
      const { ethereum } = window
      if (ethereum && ethereum.on && ethereum.removeListener) {
        ethereum.on('accountsChanged', accountsChangedListenerHandler)
        return () => ethereum.removeListener('accountsChanged', accountsChangedListenerHandler)
      }
    }
  }, [web3Initialized, web3State.connectorName])

  // export function to manually trigger an account update
  function activateAccount() {
    if (!web3Initialized) {
      // eslint-disable-next-line no-console
      console.error('Calling activateAccount in an uninitialized state is a no-op.')
      return
    }

    if (web3State.account !== null) {
      // eslint-disable-next-line no-console
      console.error('Calling activateAccount while an account is active is a no-op.')
      return
    }

    if (activeConnector)
      activeConnector.getAccount(web3State.library)
        .then(account => dispatchWeb3State({ type: 'UPDATE_ACCOUNT', payload: account }))
        .catch(error => handleError(error))
  }

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

  return [
      web3State, activeConnector,
      inAutomaticPhase, web3Initialized,
      activate, activateAccount,
      (connectorName: string): void => setActiveConnector(connectorName),
      (deactivate: boolean): void => unsetActiveConnector(deactivate),
      { accountReRenderer, forceAccountReRender, networkReRenderer, forceNetworkReRender }
    ]
}
