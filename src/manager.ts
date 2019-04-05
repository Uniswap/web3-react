import { ethers } from 'ethers'
import { useCallback, useEffect, useReducer } from 'react'

import { Connector } from './connectors'
import { IConnectors, Provider } from './types'

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
  setConnector: (connectorName: string, suppressAndThrowErrors?: boolean) => Promise<void>
  setFirstValidConnector: (connectorNames: string[], suppressAndThrowErrors?: boolean) => Promise<void>
  unsetConnector: () => void
  setError: (error: Error, connectorName?: string) => void
}

interface IWeb3State {
  connectorName?: string
  provider?: Provider
  networkId?: number
  account?: string | null
  error: Error | null
}

const initialWeb3State: IWeb3State = {
  account: undefined,
  connectorName: undefined,
  error: null,
  networkId: undefined,
  provider: undefined
}

function normalizeAccount(account: string | null) {
  return account === null ? account : ethers.utils.getAddress(account)
}

function web3StateReducer(state: IWeb3State, action: any): IWeb3State {
  switch (action.type) {
    case 'UPDATE_CONNECTOR_VALUES': {
      const { connectorName, provider, networkId, account } = action.payload
      return { connectorName, provider, networkId, account: normalizeAccount(account), error: null }
    }
    case 'UPDATE_NETWORK_ID': {
      const { provider, networkId } = action.payload
      return { ...state, provider: provider || state.provider, networkId, error: null }
    }
    case 'UPDATE_ACCOUNT':
      return { ...state, account: normalizeAccount(action.payload) }
    case 'UPDATE_NETWORK_ID_AND_ACCOUNT': {
      const { provider, networkId, account } = action.payload
      return {
        ...state,
        account: normalizeAccount(account),
        error: null,
        networkId,
        provider: provider || state.provider
      }
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

export default function useWeb3Manager(connectors: IConnectors): IWeb3Manager {
  // keep track of web3 state
  const [web3State, dispatchWeb3State] = useReducer(web3StateReducer, initialWeb3State)
  const web3Initialized: boolean = !!(
    web3State.account !== undefined &&
    web3State.connectorName &&
    !web3State.error &&
    web3State.provider &&
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
      const provider = await connector.getProvider()
      const networkIdPromise = connector.getNetworkId(provider)
      const accountPromise = connector.getAccount(provider)
      await Promise.all([networkIdPromise, accountPromise]).then(([networkId, account]) => {
        dispatchWeb3State({
          payload: { connectorName, provider, networkId, account },
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
    suppressAndThrowErrors: boolean = false
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

  const web3ReactUpdateNetworkIdHandler = useCallback(
    async (networkId?: number, bypassCheck: boolean = false): Promise<void> => {
      if (!activeConnector) {
        const error = Error(unexpectedErrorMessage)
        error.code = ManagerErrorCodes.UNEXPECTED_ERROR
        console.error(error) // tslint:disable-line: no-console
        setError(error)
      } else {
        if (networkId && bypassCheck) {
          dispatchWeb3State({
            payload: { networkId },
            type: 'UPDATE_NETWORK_ID'
          })
        } else {
          try {
            const provider: Provider = await activeConnector.getProvider(networkId)
            const returnedNetworkId = await activeConnector.getNetworkId(provider)

            // this indicates an error in the way the active connector's 'getProvider' function is implemented
            if (networkId && networkId !== returnedNetworkId) {
              const error = Error(unexpectedErrorMessage)
              error.code = ManagerErrorCodes.UNEXPECTED_ERROR
              throw error
            } else {
              dispatchWeb3State({
                payload: { provider, networkId: returnedNetworkId },
                type: 'UPDATE_NETWORK_ID'
              })
            }
          } catch (error) {
            setError(error)
          }
        }
      }
    },
    [activeConnector]
  )

  const web3ReactUpdateAccountHandler = useCallback(
    async (account?: string, bypassCheck: boolean = false): Promise<void> => {
      if (!activeConnector) {
        const error = Error(unexpectedErrorMessage)
        error.code = ManagerErrorCodes.UNEXPECTED_ERROR
        console.error(error) // tslint:disable-line: no-console
        setError(error)
      } else {
        if (account && bypassCheck) {
          dispatchWeb3State({
            payload: account,
            type: 'UPDATE_ACCOUNT'
          })
        } else {
          try {
            const returnedAccount = await activeConnector.getAccount(web3State.provider)

            // this indicates an error in the way the active connector's 'getAccount' function is implemented
            if (account && normalizeAccount(account) !== normalizeAccount(returnedAccount)) {
              const error = Error(unexpectedErrorMessage)
              error.code = ManagerErrorCodes.UNEXPECTED_ERROR
              throw error
            } else {
              dispatchWeb3State({
                payload: returnedAccount,
                type: 'UPDATE_ACCOUNT'
              })
            }
          } catch (error) {
            setError(error)
          }
        }
      }
    },
    [activeConnector, web3State.provider]
  )

  const web3ReactUpdateNetworkIdAndAccountHandler = useCallback(
    async (
      networkId?: number,
      bypassNetworkIdCheck: boolean = false,
      account?: string,
      bypassAccountCheck: boolean = false
    ): Promise<void> => {
      if (!activeConnector) {
        const error = Error(unexpectedErrorMessage)
        error.code = ManagerErrorCodes.UNEXPECTED_ERROR
        console.error(error) // tslint:disable-line: no-console
        setError(error)
      } else {
        if (networkId && bypassNetworkIdCheck && account && bypassAccountCheck) {
          dispatchWeb3State({
            payload: { networkId, account },
            type: 'UPDATE_NETWORK_ID_AND_ACCOUNT'
          })
        } else {
          const provider: Provider = await (networkId && bypassNetworkIdCheck
            ? web3State.provider
            : activeConnector.getProvider(networkId))

          const networkIdPromise =
            networkId && bypassNetworkIdCheck ? networkId : activeConnector.getNetworkId(provider)
          const accountPromise = account && bypassAccountCheck ? account : activeConnector.getAccount(provider)

          await Promise.all([networkIdPromise, accountPromise]).then(([returnedNetworkId, returnedAccount]) => {
            if (
              (networkId && networkId !== returnedNetworkId) ||
              (account && normalizeAccount(account) !== normalizeAccount(returnedAccount))
            ) {
              const error = Error(unexpectedErrorMessage)
              error.code = ManagerErrorCodes.UNEXPECTED_ERROR
              throw error
            } else {
              dispatchWeb3State({
                payload: { provider, networkId: returnedNetworkId, account: returnedAccount },
                type: 'UPDATE_NETWORK_ID_AND_ACCOUNT'
              })
            }
          })
        }
      }
    },
    [activeConnector, web3State.provider]
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

  return {
    web3Initialized,
    web3State,
    connector: activeConnector, // tslint:disable-line: object-literal-sort-keys
    setConnector,
    setFirstValidConnector,
    unsetConnector,
    setError
  }
}
