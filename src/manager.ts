import { useState, useEffect, useRef, useReducer } from 'react'

import { Connector } from './connectors'
import { Connectors, Library, LibraryName } from './types'

export interface ValidWeb3State {
  active       : boolean,
  connectorName: string,
  library      : Library,
  networkId    : number,
  account      : string | null,
  error        : Error | null
}

interface UndefinedWeb3State {
  active        : boolean,
  connectorName?: string,
  library      ?: Library,
  networkId    ?: number,
  account      ?: string | null,
  error         : Error | null
}

type Web3State = ValidWeb3State | UndefinedWeb3State

export function isValidWeb3State(web3State: Web3State): web3State is ValidWeb3State {
  return !!(
    web3State.active &&
    web3State.connectorName &&
    web3State.library &&
    web3State.networkId &&
    web3State.account !== undefined &&
    !web3State.error
  )
}

interface ReRenderers {
  accountReRenderer   : number
  forceAccountReRender: Function
  networkReRenderer   : number
  forceNetworkReRender: Function
}

export interface Web3Manager {
  web3State         : Web3State
  activeConnector  ?: Connector
  inAutomaticPhase  : boolean
  web3Initialized   : boolean
  activate          : Function
  activateAccount   : Function
  setActiveConnector: Function
  resetConnectors   : Function
  reRenderers       : ReRenderers,
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
      console.log(connectorName)
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
  // all connectors that should be tried automatically.
  const automaticConnectors: React.MutableRefObject<string[]> = useRef(
    Object.keys(connectors)
      .filter(k => connectors[k].automaticPriority)
      .sort(k => connectors[k].automaticPriority || 0)
  )

  // flag for whether the automatic phase is active
  const inAutomaticPhase: React.MutableRefObject<boolean> = useRef(!passive && automaticConnectors.current.length > 0)

  // keep track of web3 state
  const [web3State, dispatchWeb3State] = useReducer(web3StateReducer, initialWeb3State)
  const web3Initialized: boolean = isValidWeb3State(web3State)

  // keep track of active connector
  const activeConnector: Connector | undefined =
    web3State.connectorName ? connectors[web3State.connectorName] : undefined

  // effect to handle first-time initialization when passive is false
  useEffect(() => { if (!passive) activate() }, [])

  // function to activate the manager
  function activate (resetAutomaticInitialization: boolean = true): void {
    if (web3State.active)
      return console.error('Calling this function while in an already-activated state is a no-op.')

    if (resetAutomaticInitialization && automaticConnectors.current.length === 0)
      return console.error(
        `Calling this function with 'resetAutomaticInitialization' as true but no automatic connectors is a no-op.`
      )

    if (resetAutomaticInitialization) {
      if (!inAutomaticPhase.current) inAutomaticPhase.current = true
      if (inAutomaticPhase.current) initializeConnectorValues(automaticConnectors.current[0])
    } else
      dispatchWeb3State({ type: 'ACTIVATE'})
  }

  function setActiveConnector (connectorName: string): void {
    if (!Object.keys(connectors).includes(connectorName))
      return console.error(`The passed 'connectorName' parameter ${connectorName} is not recognized.`)

    if (connectorName === web3State.connectorName)
      return console.error(`The ${connectorName} connector is already active.`)

    initializeConnectorValues(connectorName)
  }

  function resetConnectors (deactivate: boolean = false): void {
    if (deactivate && !passive)
      return console.error(`Calling this function with 'deactivate' as true and 'passive' as false is a no-op.`)

    dispatchWeb3State({ type: 'RESET', payload: !deactivate })
  }

  // handle errors
  function handleError(error: Error, connectorName?: string): void {
    const dispatch: Function = () => {
      connectorName ?
        dispatchWeb3State({ type: 'UPDATE_ERROR_WITH_NAME', payload: { error, connectorName } }) :
        dispatchWeb3State({ type: 'UPDATE_ERROR', payload: error })
    }

    if (!inAutomaticPhase) {
      dispatch()
    } else {
      // if the error is an unsupported network error, throw it
      if (error.code === Connector.errorCodes.UNSUPPORTED_NETWORK) {
        if (inAutomaticPhase.current) inAutomaticPhase.current = false
        dispatch()
      }

      // else, figure out what to do
      const indexOfCurrentAutomaticConnector = automaticConnectors.current.findIndex(e => e === web3State.connectorName)
      const nextAutomaticCandidate = automaticConnectors.current[indexOfCurrentAutomaticConnector + 1]
      if (nextAutomaticCandidate)
        initializeConnectorValues(nextAutomaticCandidate)
      else {
        if (inAutomaticPhase.current) inAutomaticPhase.current = false
        // TODO: think if this is the right thing to happen in this scenario.
        if (passive)
          dispatch()
        else
          resetConnectors(false)
      }
    }
  }

  // run connector initialization
  async function initializeConnectorValues (connectorName: string): Promise<void> {
    const connector: Connector = connectors[connectorName]
    try {
      await connector.onActivation()

      const library: Library = await connector.getLibrary(libraryName)

      const networkIdPromise = () => connector.getNetworkId(library)
      const accountPromise = connector.activateAccountAutomatically ? () => connector.getAccount(library) : () => null

      await Promise.all([networkIdPromise(), accountPromise()])
        .then(([networkId, account]): void  => {
          if (inAutomaticPhase.current) inAutomaticPhase.current = false
          dispatchWeb3State(
            { type: 'UPDATE_CONNECTOR_VALUES', payload: { connectorName, library, networkId, account } }
          )
        })
    } catch (error) {
      handleError(error, connectorName)
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
      return console.error('Calling this function in an uninitialized state is a no-op.')

    if (web3State.account !== null)
      return console.error('Calling this function while an account is active is a no-op.')

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
    web3State, activeConnector,
    inAutomaticPhase: inAutomaticPhase.current, web3Initialized,
    activate, activateAccount,
    setActiveConnector, resetConnectors,
    reRenderers: { accountReRenderer, forceAccountReRender, networkReRenderer, forceNetworkReRender }
  }
}
