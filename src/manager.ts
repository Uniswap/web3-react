import { useEffect, useReducer } from 'react'

import { Connector } from './connectors'
import { IConnectors, IReRendererState, Library, LibraryName } from './types'

export interface IWeb3Manager {
  web3Initialized: boolean
  web3State: IWeb3State
  setConnector: Function // tslint:disable-line: ban-types
  setFirstValidConnector: Function // tslint:disable-line: ban-types
  unsetConnector: Function // tslint:disable-line: ban-types
  reRenderers: IReRendererState
  forceReRender: Function // tslint:disable-line: ban-types
}

interface IWeb3State {
  connectorName?: string
  library?: Library
  networkId?: number
  account?: string | null
  error: Error | null
}

const initialWeb3State: IWeb3State = {
  account: undefined,
  connectorName: undefined,
  error: null,
  library: undefined,
  networkId: undefined
}

function reRendererReducer(state: any, action: any): IReRendererState {
  switch (action.type) {
    case 'RERENDER':
      return { ...state, [action.payload]: state[action.payload] + 1 }
    default: {
      const errorMessage = 'Unexpected default case.'
      console.error(errorMessage) // tslint:disable-line: no-console
      throw Error(errorMessage)
    }
  }
}

function web3StateReducer(state: any, action: any): IWeb3State {
  switch (action.type) {
    case 'UPDATE_CONNECTOR_VALUES': {
      const { connectorName, library, networkId, account } = action.payload
      return { connectorName, library, networkId, account, error: null }
    }
    case 'UPDATE_NETWORK_ID': {
      const { library, networkId } = action.payload
      return { ...state, library, networkId, error: null }
    }
    case 'UPDATE_ACCOUNT':
      return { ...state, account: action.payload, error: null }
    case 'UPDATE_NETWORK_ID_AND_ACCOUNT': {
      const { library, networkId, account } = action.payload
      return { ...state, library, networkId, account, error: null }
    }
    case 'UPDATE_ERROR':
      return { ...state, error: action.payload }
    case 'UPDATE_ERROR_WITH_NAME': {
      const { error, connectorName } = action.payload
      return { ...state, error, connectorName }
    }
    case 'RESET':
      return initialWeb3State
    default: {
      const errorMessage = 'Unexpected default case.'
      console.error(errorMessage) // tslint:disable-line: no-console
      throw Error(errorMessage)
    }
  }
}

export default function useWeb3Manager(
  connectors: IConnectors,
  libraryName: LibraryName,
  reRendererNames: string[]
): IWeb3Manager {
  // keep track of web3 state
  const [web3State, dispatchWeb3State] = useReducer(web3StateReducer, initialWeb3State)
  const web3Initialized: boolean = !!(
    web3State.account !== undefined &&
    web3State.connectorName &&
    !web3State.error &&
    web3State.library &&
    web3State.networkId
  )

  // keep track of active connector
  const activeConnector: Connector | undefined = web3State.connectorName
    ? connectors[web3State.connectorName]
    : undefined

  // function to set a connector
  async function setConnector(connectorName: string, suppressAndthrowErrors: boolean = false): Promise<void> {
    const validConnectorNames = Object.keys(connectors)
    try {
      if (!validConnectorNames.includes(connectorName)) {
        throw Error(`'${connectorName}' is not a valid name. Valid values are: ${validConnectorNames.join(', ')}`)
      }

      if (connectorName === web3State.connectorName) {
        throw Error(`'${connectorName}' is already set.`)
      }

      // at this point, begin initializing the connector
      const connector: Connector = connectors[connectorName]
      await connector.onActivation()
      const library: Library = await connector.getLibrary(libraryName)
      const networkIdPromise = connector.getNetworkId(library)
      const accountPromise = connector.getAccount(library)
      await Promise.all([networkIdPromise, accountPromise]).then(([networkId, account]) => {
        dispatchWeb3State({
          payload: { connectorName, library, networkId, account },
          type: 'UPDATE_CONNECTOR_VALUES'
        })
      })
    } catch (error) {
      if (suppressAndthrowErrors) {
        throw error
      } else {
        setError(error, connectorName)
      }
    }
  }

  // don't expose suppressAndthrowErrors to users...
  function setConnectorWrapped(connectorName: string) {
    setConnector(connectorName)
  }

  // ...except when initializing many
  async function setFirstValidConnector(connectorNames: string[]) {
    for (const connectorName of connectorNames) {
      try {
        await setConnector(connectorName, true)
        break
      } catch (error) {
        if (connectorName === connectorNames[connectorNames.length - 1]) {
          throw Error('Unable to set any valid connector.')
        }
      }
    }
  }

  // function to unset the current connector
  function unsetConnector(): void {
    dispatchWeb3State({ type: 'RESET' })
  }

  // function to set the error state
  function setError(error: Error, connectorName?: string) {
    if (connectorName) {
      dispatchWeb3State({ type: 'UPDATE_ERROR_WITH_NAME', payload: { error, connectorName } })
    } else {
      dispatchWeb3State({ type: 'UPDATE_ERROR', payload: error })
    }
  }

  // ensure that connectors are cleaned up whenever they're changed
  useEffect(() => {
    if (activeConnector) {
      return () => activeConnector.onDeactivation()
    }
  }, [activeConnector])

  // change listeners
  async function web3ReactSharedHandler(networkId: number, account?: string) {
    if (!activeConnector) {
      setError(Error('Unexpected Error. Please file an issue on Github.'))
    } else {
      // since e.g. walletconnect reports back a chainID and an account on _every_ `connect`/`session_update`,...
      // ...we bail on updating the library and networkId if the networkId hasn't checked
      if (account && networkId === web3State.networkId) {
        web3ReactUpdateAccountHandler(account)
      } else {
        try {
          const library: Library = await activeConnector.getLibrary(libraryName, networkId)
          // we technically don't need to call this if we trust the connector is implemented in a particular way...
          // ...though this is required _if_ we only validate network IDs inside getNetworkId, which we kind of want
          const returnedNetworkId = await activeConnector.getNetworkId(library)
          // also, we _could_ call .getAccount(), but that seems pretty redundant, so we just take it for granted...
          // ...that the new account is correct!

          // this indicates an error in the way the active connector's 'getLibrary' function is implemented
          if (networkId !== returnedNetworkId) {
            setError(Error(`Mismatched Network IDs. Expected: ${networkId}. Received: ${returnedNetworkId}.`))
          } else {
            if (account) {
              dispatchWeb3State({ type: 'UPDATE_NETWORK_ID_AND_ACCOUNT', payload: { library, networkId, account } })
            } else {
              dispatchWeb3State({ type: 'UPDATE_NETWORK_ID', payload: { library, networkId } })
            }
          }
        } catch (error) {
          setError(Error('Unexpected Error. Please file an issue on Github.'))
        }
      }
    }
  }

  function web3ReactUpdateNetworkIdHandler(networkId: number) {
    web3ReactSharedHandler(networkId)
  }

  function web3ReactUpdateAccountHandler(account: string): void {
    dispatchWeb3State({ type: 'UPDATE_ACCOUNT', payload: account })
  }

  function web3ReactUpdateNetworkIdAndAccountHandler(networkId: number, account: string) {
    web3ReactSharedHandler(networkId, account)
  }

  function web3ReactErrorHandler(error: Error) {
    setError(error)
  }

  function web3ReactResetHandler() {
    unsetConnector()
  }

  useEffect(() => {
    if (activeConnector) {
      activeConnector.on('_web3ReactUpdateNetworkId', web3ReactUpdateNetworkIdHandler)
      activeConnector.on('_web3ReactUpdateAccount', web3ReactUpdateAccountHandler)
      activeConnector.on('_web3ReactUpdateNetworkIdAndAccount', web3ReactUpdateNetworkIdAndAccountHandler)
      activeConnector.on('_web3ReactError', web3ReactErrorHandler)
      activeConnector.on('_web3ReactReset', web3ReactResetHandler)
      return () => {
        activeConnector.removeListener('_web3ReactUpdateNetworkId', web3ReactUpdateNetworkIdHandler)
        activeConnector.removeListener('_web3ReactUpdateAccount', web3ReactUpdateAccountHandler)
        activeConnector.removeListener('_web3ReactUpdateNetworkIdAndAccount', web3ReactUpdateNetworkIdAndAccountHandler)
        activeConnector.removeListener('_web3ReactError', web3ReactErrorHandler)
        activeConnector.removeListener('_web3ReactReset', web3ReactResetHandler)
      }
    }
  }, [activeConnector, web3State.networkId]) // risky!!! there may be other dependencies in the handlers

  // re renderers
  const [reRenderers, dispatchReRender] = useReducer(
    reRendererReducer,
    reRendererNames.reduce((accumulator: IReRendererState, currentValue: string) => {
      accumulator[currentValue] = 0
      return accumulator
    }, {})
  )

  function forceReRender(reRenderer: string) {
    const validReRendererNames = Object.keys(reRenderers)
    if (!validReRendererNames.includes(reRenderer)) {
      setError(Error(`'${reRenderer}' is not a valid name. Valid values are: ${validReRendererNames.join(', ')}`))
    }
    dispatchReRender({ type: 'RERENDER', payload: reRenderer })
  }

  return {
    web3Initialized,
    web3State,
    setConnector: setConnectorWrapped, // tslint:disable-line: object-literal-sort-keys
    setFirstValidConnector,
    unsetConnector,
    reRenderers,
    forceReRender
  }
}
