import { useCallback, useEffect, useReducer } from 'react'

import { Connector } from './connectors'
import { IConnectors, IReRendererState, Library, LibraryName } from './types'

export const ManagerErrorCodes = ['UNEXPECTED_ERROR', 'ALL_CONNECTORS_INVALID'].reduce(
  (accumulator: any, currentValue: string) => {
    accumulator[currentValue] = currentValue
    return accumulator
  },
  {}
)
const unexpectedErrorMessage = 'Unexpected Error. Please file an issue on Github.'

export interface IWeb3Manager {
  web3Initialized: boolean
  web3State: IWeb3State
  connector: any
  setConnector: Function // tslint:disable-line: ban-types
  setFirstValidConnector: Function // tslint:disable-line: ban-types
  unsetConnector: Function // tslint:disable-line: ban-types
  setError: Function // tslint:disable-line: ban-types
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
      const error = Error(unexpectedErrorMessage)
      console.error(error, state, action) // tslint:disable-line: no-console
      throw error
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
      const error = Error(unexpectedErrorMessage)
      console.error(error, state, action) // tslint:disable-line: no-console
      throw error
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

  // TODO consider exposing this in context?
  // keep track of active connector
  const activeConnector: Connector | undefined = web3State.connectorName
    ? connectors[web3State.connectorName]
    : undefined

  // function to set a connector
  async function setConnector(connectorName: string, suppressAndThrowErrors: boolean = false): Promise<void> {
    const validConnectorNames = Object.keys(connectors)
    try {
      if (!validConnectorNames.includes(connectorName)) {
        const error = Error(
          `'${connectorName}' is not a valid name. Valid names are: ${validConnectorNames.join(', ')}`
        )
        error.code = ManagerErrorCodes.UNEXPECTED_ERROR
        console.error(error) // tslint:disable-line: no-console
        throw error
      }

      if (connectorName === web3State.connectorName) {
        const error = Error(`'${connectorName}' is already set.`)
        error.code = ManagerErrorCodes.UNEXPECTED_ERROR
        console.error(error) // tslint:disable-line: no-console
        throw error
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
      if (suppressAndThrowErrors) {
        throw error
      } else {
        setError(error, connectorName)
      }
    }
  }

  // expose a wrapper to set the first valid connector in a list
  async function setFirstValidConnector(
    connectorNames: string[],
    suppressAndThrowErrors: boolean = true
  ): Promise<void> {
    for (const connectorName of connectorNames) {
      try {
        await setConnector(connectorName, true)
        break
      } catch (error) {
        if (connectorName === connectorNames[connectorNames.length - 1]) {
          const error = Error('Unable to set any valid connector.')
          error.code = ManagerErrorCodes.ALL_CONNECTORS_INVALID
          if (suppressAndThrowErrors) {
            throw error
          } else {
            setError(error)
          }
        }
      }
    }
  }

  // function to unset the current connector
  function unsetConnector(): void {
    dispatchWeb3State({ type: 'RESET' })
  }

  // function to set the error state. consider adding a (global?) flag to clear state on error?
  function setError(error: Error, connectorName?: string): void {
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
  const web3ReactSharedHandler = useCallback(
    async (networkId: number, account?: string): Promise<void> => {
      if (!activeConnector) {
        const error = Error(unexpectedErrorMessage)
        error.code = ManagerErrorCodes.UNEXPECTED_ERROR
        console.error(error) // tslint:disable-line: no-console
        setError(error)
      } else {
        // if the networkId matches the currently active networkId, we bail on updating the library and networkId
        if (networkId === web3State.networkId) {
          if (account) {
            web3ReactUpdateAccountHandler(account)
          }
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
              const error = Error(unexpectedErrorMessage)
              error.code = ManagerErrorCodes.UNEXPECTED_ERROR
              console.error(error) // tslint:disable-line: no-console
              setError(error)
            } else {
              if (account) {
                dispatchWeb3State({ type: 'UPDATE_NETWORK_ID_AND_ACCOUNT', payload: { library, networkId, account } })
              } else {
                dispatchWeb3State({ type: 'UPDATE_NETWORK_ID', payload: { library, networkId } })
              }
            }
          } catch (error) {
            setError(error)
          }
        }
      }
    },
    [activeConnector, web3State.networkId]
  )

  const web3ReactUpdateNetworkIdHandler = useCallback(
    (networkId: number): void => {
      web3ReactSharedHandler(networkId)
    },
    [web3ReactSharedHandler]
  )

  // this is pure, we don't need to worry about useCallback
  function web3ReactUpdateAccountHandler(account: string): void {
    dispatchWeb3State({ type: 'UPDATE_ACCOUNT', payload: account })
  }

  const web3ReactUpdateNetworkIdAndAccountHandler = useCallback(
    (networkId: number, account: string): void => {
      web3ReactSharedHandler(networkId, account)
    },
    [web3ReactSharedHandler]
  )

  // this is pure, we don't need to worry about useCallback
  function web3ReactErrorHandler(error: Error): void {
    setError(error)
  }

  // this is pure, we don't need to worry about useCallback
  function web3ReactResetHandler(): void {
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
  }, [activeConnector, web3ReactUpdateNetworkIdHandler, web3ReactUpdateNetworkIdAndAccountHandler])

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
      const error = Error(`'${reRenderer}' is not a valid name. Valid values are: ${validReRendererNames.join(', ')}`)
      error.code = ManagerErrorCodes.UNEXPECTED_ERROR
      console.error(error) // tslint:disable-line: no-console
      setError(error)
    }
    dispatchReRender({ type: 'RERENDER', payload: reRenderer })
  }

  return {
    web3Initialized,
    web3State,
    connector: activeConnector, // tslint:disable-line: object-literal-sort-keys
    setConnector,
    setFirstValidConnector,
    unsetConnector,
    setError,
    reRenderers,
    forceReRender
  }
}
