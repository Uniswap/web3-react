import { useState, useEffect, useRef, useReducer } from 'react'

import { Connector, WalletConnectConnector } from './connectors'
import { Connectors, Library, LibraryName } from './types'

interface Web3State {
  active        : boolean,
  connectorName?: string,
  library      ?: Library,
  networkId    ?: number,
  account      ?: string | null,
  error         : Error | null
}

interface ReRenderers {
  accountReRenderer   : number
  forceAccountReRender: Function
  networkReRenderer   : number
  forceNetworkReRender: Function
}

export interface Web3Manager {
  web3State       : Web3State
  inAutomaticPhase: boolean
  web3Initialized : boolean
  activate        : Function
  activateAccount : Function
  setConnector    : Function
  resetConnectors : Function
  reRenderers     : ReRenderers,
}

const initialWeb3State: Web3State = {
  active       : false,
  connectorName: undefined,
  library      : undefined,
  networkId    : undefined,
  account      : undefined,
  error        : null
}

function web3StateReducer (state: any, action: any): Web3State {
  switch (action.type) {
    case 'ACTIVATE':
      return { ...initialWeb3State, active: true }
    case 'UPDATE_CONNECTOR_VALUES': {
      const { connectorName, library, networkId, account } = action.payload
      return { active: true, connectorName, library, networkId, account, error: null }
    }
    case 'UPDATE_NETWORK_ID':
      return { ...state, networkId: action.payload }
    case 'UPDATE_ACCOUNT':
      return { ...state, account: action.payload }
    case 'UPDATE_ERROR':
      return { ...state, error: action.payload }
    case 'UPDATE_ERROR_WITH_NAME': {
      const { error, connectorName } = action.payload
      return { ...state, error, connectorName }
    }
    case 'RESET':
      return { ...initialWeb3State, active: action.payload }
    default:
      throw Error('No default case.')
  }
}

export default function useWeb3Manager (
  connectors: Connectors, passive: boolean, libraryName: LibraryName
): Web3Manager {
  // all connectors that should be tried automatically
  const automaticConnectors: React.MutableRefObject<string[]> = useRef(
    Object.keys(connectors)
      .filter(k => connectors[k].automaticPriority)
      .sort(k => connectors[k].automaticPriority || 0)
  )

  // flag for whether the automatic phase is active
  const inAutomaticPhase: React.MutableRefObject<boolean> = useRef(!passive && automaticConnectors.current.length > 0)

  // keep track of web3 state
  const [web3State, dispatchWeb3State] = useReducer(web3StateReducer, initialWeb3State, passive ? undefined : { type: 'ACTIVATE'})
  const web3Initialized: boolean = !!(
    web3State.active &&
    web3State.connectorName &&
    web3State.library &&
    web3State.networkId &&
    web3State.account !== undefined &&
    !web3State.error
  )

  // keep track of active connector
  const activeConnector: Connector | undefined =
    web3State.connectorName ? connectors[web3State.connectorName] : undefined

  // run first-time activation in case of automatic connectors
  useEffect(() => { if (!passive) activate(true) }, [])

  // function to activate the manager
  function activate (firstCall: boolean = false): void {
    if (!firstCall && web3State.active)
      return console.warn('Calling this function while in an already-activated state is a no-op.')

    if (inAutomaticPhase.current && automaticConnectors.current.length > 0)
      initializeConnectorValues(automaticConnectors.current[0])
    else
      if (!web3State.active) dispatchWeb3State({ type: 'ACTIVATE'})
  }

  // function to set a connector
  function setConnector (connectorName: string): void {
    if (!Object.keys(connectors).includes(connectorName))
      return console.error(`The passed 'connectorName' parameter ${connectorName} is not recognized.`)

    if (connectorName === web3State.connectorName)
      return console.error(`The ${connectorName} connector is already set.`)

    initializeConnectorValues(connectorName)
  }

  // function to reset connectors
  function resetConnectors (tryAutomaticAgain: boolean = false, deactivate: boolean = false): void {
    if (tryAutomaticAgain && deactivate)
      return console.error(`Calling this function with 'tryAutomaticAgain' and 'deactivate' as true is not allowed.`)

    if (tryAutomaticAgain && automaticConnectors.current.length === 0)
      return console.error(
        `Calling this function with 'tryAutomaticAgain' as true but no automatic connectors is not allowed.`
      )

    if (tryAutomaticAgain) {
      if (!inAutomaticPhase.current) inAutomaticPhase.current = true
      initializeConnectorValues(automaticConnectors.current[0])
    } else {
      dispatchWeb3State({ type: 'RESET', payload: !deactivate })
    }
  }

  // initialize a connector
  async function initializeConnectorValues (connectorName: string): Promise<void> {
    const connector: Connector = connectors[connectorName]
    try {
      await connector.onActivation()

      const library: Library = await connector.getLibrary(libraryName)

      const networkIdPromise = () => connector.getNetworkId(library)
      const accountPromise = connector.activateAccountAutomatically ? () => connector.getAccount(library) : () => null

      await Promise.all([networkIdPromise(), accountPromise()])
        .then(([networkId, account])  => {
          if (inAutomaticPhase.current) inAutomaticPhase.current = false
          dispatchWeb3State(
            { type: 'UPDATE_CONNECTOR_VALUES', payload: { connectorName, library, networkId, account } }
          )
        })
    } catch (error) {
      handleError(error, connectorName)
    }
  }

  // handle errors
  function handleError(error: Error, connectorName?: string): void {
    if (error.code === WalletConnectConnector.errorCodes.WALLETCONNECT_TIMEOUT) return

    const dispatchError: Function = () => {
      connectorName ?
        dispatchWeb3State({ type: 'UPDATE_ERROR_WITH_NAME', payload: { error, connectorName } }) :
        dispatchWeb3State({ type: 'UPDATE_ERROR', payload: error })
    }

    if (!inAutomaticPhase.current) {
      dispatchError()
    } else {
      // if the error is an unsupported network error, throw it
      if (error.code === Connector.errorCodes.UNSUPPORTED_NETWORK) {
        if (inAutomaticPhase.current) inAutomaticPhase.current = false
        dispatchError()
      }

      // else, figure out what to do
      const indexOfCurrentAutomaticConnector = automaticConnectors.current.findIndex(e => e === web3State.connectorName)
      const nextAutomaticCandidate = automaticConnectors.current[indexOfCurrentAutomaticConnector + 1]
      if (nextAutomaticCandidate)
        initializeConnectorValues(nextAutomaticCandidate)
      else {
        inAutomaticPhase.current = false
        resetConnectors(false) // TODO: consider adding a flag that allows this to instead call dispatchError()
      }
    }
  }

  // ensure that connectors are cleaned up whenever they're changed
  useEffect(() => { if (activeConnector) return () => activeConnector.onDeactivation() }, [activeConnector])

  // change listeners
  function networkChangedListenerHandler(networkId: number): void {
    dispatchWeb3State({ type: 'UPDATE_NETWORK_ID', payload: networkId })
  }
  function accountsChangedListenerHandler(accounts: string[]): void {
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
  }, [web3Initialized, activeConnector, web3State.connectorName])
  useEffect(() => {
    if (web3Initialized && activeConnector && activeConnector.listenForAccountChanges) {
      const { ethereum } = window
      if (ethereum && ethereum.on && ethereum.removeListener) {
        ethereum.on('accountsChanged', accountsChangedListenerHandler)
        return () => ethereum.removeListener('accountsChanged', accountsChangedListenerHandler)
      }
    }
  }, [web3Initialized, activeConnector, web3State.connectorName])

  // export function to manually trigger an account update
  function activateAccount(): void {
    if (!web3Initialized)
      return console.warn('Calling this function in an uninitialized state is a no-op.')

    if (web3State.account !== null)
      return console.warn('Calling this function while an account is active is a no-op.')

    if (activeConnector && web3State.library)
      activeConnector.getAccount(web3State.library)
        .then(account => dispatchWeb3State({ type: 'UPDATE_ACCOUNT', payload: account }))
        .catch(error => handleError(error))
  }

  // re renderers
  const [networkReRenderer, setNetworkReRenderer]: [number, Function] = useState(0)
  const [accountReRenderer, setAccountReRenderer]: [number, Function] = useState(0)
  function forceNetworkReRender () { setNetworkReRenderer(networkReRenderer + 1) }
  function forceAccountReRender () { setAccountReRenderer(accountReRenderer + 1) }

  return {
    web3State,
    inAutomaticPhase: inAutomaticPhase.current, web3Initialized,
    activate: () => activate(), activateAccount,
    setConnector, resetConnectors,
    reRenderers: { accountReRenderer, forceAccountReRender, networkReRenderer, forceNetworkReRender }
  }
}
