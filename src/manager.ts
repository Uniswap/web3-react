import { ethers } from 'ethers'
import { MutableRefObject, useEffect, useReducer, useRef } from 'react'

import { Connector } from './connectors'
import { Connectors } from './provider'

export type Provider = any

export const ManagerErrorCodes = ['UNEXPECTED_ERROR', 'ALL_CONNECTORS_INVALID'].reduce(
  (accumulator: any, currentValue: string): any => {
    accumulator[currentValue] = currentValue
    return accumulator
  },
  {}
)

const unexpectedErrorMessage = 'web3-react encountered an unexpected internal error. See the console for details.'
const unexpectedError = Error(unexpectedErrorMessage)
unexpectedError.code = ManagerErrorCodes.UNEXPECTED_ERROR

interface SetConnectorOptions {
  suppressAndThrowErrors?: boolean
  networkId?: number
}

interface SetFirstValidConnectorOptions {
  suppressAndThrowErrors?: boolean
  networkIds?: number[]
}

interface SetErrorOptions {
  preserveConnector?: boolean
}

export interface Web3ReactUpdateHandlerOptions {
  updateNetworkId?: boolean
  updateAccount?: boolean
  overrideNetworkIdCheck?: boolean
  overrideAccountCheck?: boolean
  networkId?: number
  account?: string
}

interface Web3State {
  connectorName?: string
  provider?: Provider
  networkId?: number
  account?: string | null
  error: Error | null
}

export interface ManagerFunctions {
  setConnector: (connectorName: string, options?: SetConnectorOptions) => Promise<void>
  setFirstValidConnector: (connectorNames: string[], options?: SetFirstValidConnectorOptions) => Promise<void>
  unsetConnector: () => void
  setError: (error: Error, options?: SetErrorOptions) => void
}

interface Web3Manager extends ManagerFunctions {
  web3Initialized: boolean
  web3State: Web3State
  connector: any
}

const initialWeb3State: Web3State = {
  account: undefined,
  connectorName: undefined,
  error: null,
  networkId: undefined,
  provider: undefined
}

function normalizeAccount(account: string | null): string | null {
  return account === null ? account : ethers.utils.getAddress(account)
}

function useRefId(): [MutableRefObject<number>, () => void] {
  const refId: MutableRefObject<number> = useRef(0)

  function increment(): void {
    refId.current += 1
  }

  return [refId, increment]
}

function usePrevious<T>(trackedValue: T): T | undefined {
  const ref: MutableRefObject<T | undefined> = useRef()

  useEffect((): void => {
    ref.current = trackedValue
  }, [trackedValue])

  return ref.current
}

function web3StateReducer(state: Web3State, action: any): Web3State {
  switch (action.type) {
    case 'UPDATE_CONNECTOR_VALUES': {
      const { connectorName, provider, networkId, account } = action.payload
      return { connectorName, provider, networkId, account: normalizeAccount(account), error: null }
    }
    case 'UPDATE_NETWORK_ID': {
      const { provider, networkId } = action.payload
      return { ...state, provider: provider || state.provider, networkId, error: null }
    }
    case 'UPDATE_ACCOUNT': {
      const { provider, account } = action.payload
      return { ...state, provider: provider || state.provider, account: normalizeAccount(account), error: null }
    }
    case 'UPDATE_NETWORK_ID_AND_ACCOUNT': {
      const { provider, networkId, account } = action.payload
      return {
        ...state,
        provider: provider || state.provider,
        account: normalizeAccount(account),
        error: null,
        networkId
      }
    }
    case 'SET_ERROR':
      return { ...initialWeb3State, error: action.payload }
    case 'SET_ERROR_PRESERVE_CONNECTOR_NAME':
      return { ...initialWeb3State, connectorName: state.connectorName, error: action.payload }
    case 'RESET':
      return initialWeb3State
    default: {
      // eslint-disable-next-line no-console
      console.warn('Default case encountered in web3StateReducer. Please file an issue on Github.')
      return { ...state, provider: undefined, networkId: undefined, account: undefined, error: unexpectedError }
    }
  }
}

export default function useWeb3Manager(connectors: Connectors): Web3Manager {
  const [refId, incrementRefId] = useRefId()

  // keep track of web3 state
  const [web3State, dispatchWeb3State] = useReducer(web3StateReducer, initialWeb3State)
  const web3Initialized: boolean = !!(
    web3State.account !== undefined &&
    web3State.connectorName &&
    !web3State.error &&
    web3State.provider &&
    web3State.networkId
  )

  // keep track of active connector
  const activeConnector: Connector | undefined = web3State.connectorName
    ? connectors[web3State.connectorName]
    : undefined

  // function to set the error state.
  function setError(error: Error, { preserveConnector = true }: SetErrorOptions = {}): void {
    if (preserveConnector) {
      dispatchWeb3State({
        type: 'SET_ERROR_PRESERVE_CONNECTOR_NAME',
        payload: error
      })
    } else {
      dispatchWeb3State({
        type: 'SET_ERROR',
        payload: error
      })
    }
  }

  // function to set a connector
  async function setConnector(
    connectorName: string,
    { suppressAndThrowErrors = false, networkId }: SetConnectorOptions = {}
  ): Promise<void> {
    const callingTimeRefId = refId.current
    incrementRefId()

    const validConnectorNames = Object.keys(connectors)
    const connector: Connector = connectors[connectorName]

    if (!validConnectorNames.includes(connectorName)) {
      // eslint-disable-next-line no-console
      console.warn(`'${connectorName}' is not a valid name, please pass one of: ${validConnectorNames.join(', ')}.`)
      return
    }

    if (connectorName === web3State.connectorName) {
      // eslint-disable-next-line no-console
      console.warn(
        `'${connectorName}' is already set. Calling 'setConnector' for a connector while it is active is a no-op.'`
      )
      return
    }

    // at this point, begin initializing the connector
    try {
      await connector.onActivation()
      const provider = await connector.getProvider(networkId)
      const networkIdPromise = connector.getNetworkId(provider)
      const accountPromise = connector.getAccount(provider)
      await Promise.all([networkIdPromise, accountPromise]).then(
        ([networkId, account]): void => {
          if (refId.current !== callingTimeRefId + 1) {
            // eslint-disable-next-line no-console
            console.warn(`Silently suppressing status update from stale connector '${connectorName}'.`)
            return
          }

          dispatchWeb3State({
            payload: { connectorName, provider, networkId, account },
            type: 'UPDATE_CONNECTOR_VALUES'
          })
        }
      )
    } catch (error) {
      // if the component has re-rendered since this function was called, eat the error
      if (refId.current !== callingTimeRefId + 1) {
        // eslint-disable-next-line no-console
        console.warn(`Silently handling error from '${connectorName}': ${error.toString()}`)
        return
      }

      if (suppressAndThrowErrors) {
        throw error
      } else {
        setError(error)
      }
    }
  }

  // expose a wrapper to set the first valid connector in a list
  async function setFirstValidConnector(
    connectorNames: string[],
    { suppressAndThrowErrors = false, networkIds = [] }: SetFirstValidConnectorOptions = {}
  ): Promise<void> {
    for (const connectorName of connectorNames) {
      try {
        await setConnector(connectorName, {
          suppressAndThrowErrors: true,
          networkId: networkIds[connectorNames.indexOf(connectorName)]
        })
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

  const lastConnector = usePrevious(activeConnector)

  useEffect((): void => {
    if (activeConnector === undefined && lastConnector !== undefined) {
      lastConnector.onDeactivation(web3State.error)
    }
  }, [activeConnector, lastConnector, web3State.error])

  async function web3ReactUpdateHandler({
    updateNetworkId = false,
    updateAccount = false,
    overrideNetworkIdCheck = false,
    overrideAccountCheck = false,
    networkId,
    account
  }: Web3ReactUpdateHandlerOptions = {}): Promise<void> {
    if (!activeConnector) {
      // eslint-disable-next-line no-console
      console.warn('No active connector in web3ReactUpdateHandler call. Please file an issue on Github.')
      setError(unexpectedError)
      return
    }

    if (
      (!updateNetworkId && !updateAccount) ||
      (updateNetworkId && overrideNetworkIdCheck && !networkId) ||
      (updateAccount && overrideAccountCheck && !account)
    ) {
      console.warn('Malformed parameters passed to web3ReactUpdateHandler.') // eslint-disable-line no-console
      setError(unexpectedError)

      return
    }

    // no checks required
    if (
      (!updateNetworkId || (updateNetworkId && overrideNetworkIdCheck)) &&
      (!updateAccount || (updateAccount && overrideAccountCheck))
    ) {
      if (updateNetworkId && !updateAccount) {
        dispatchWeb3State({
          payload: { networkId },
          type: 'UPDATE_NETWORK_ID'
        })
      } else if (!updateNetworkId && updateAccount) {
        dispatchWeb3State({
          payload: { account },
          type: 'UPDATE_ACCOUNT'
        })
      } else {
        dispatchWeb3State({
          payload: { networkId, account },
          type: 'UPDATE_NETWORK_ID_AND_ACCOUNT'
        })
      }

      return
    }

    // one or more checks required
    try {
      const fetchNewProvider = !web3State.provider || (updateNetworkId && !overrideNetworkIdCheck)
      const provider = await (fetchNewProvider ? activeConnector.getProvider(networkId) : web3State.provider)

      const fetchNewNetworkId = web3State.networkId === undefined || (updateNetworkId && !overrideNetworkIdCheck)
      const networkIdPromise =
        web3State.networkId === undefined || fetchNewNetworkId
          ? activeConnector.getNetworkId(provider)
          : web3State.networkId

      const fetchNewAccount = web3State.account === undefined || (updateAccount && !overrideAccountCheck)
      const accountPromise =
        web3State.account === undefined || fetchNewAccount ? activeConnector.getAccount(provider) : web3State.account

      await Promise.all([networkIdPromise, accountPromise]).then(
        ([returnedNetworkId, returnedAccount]): void => {
          if (updateNetworkId && networkId && networkId !== returnedNetworkId) {
            // eslint-disable-next-line no-console
            console.warn(`Mismatched networkIds in web3ReactUpdateHandler: ${networkId} and ${returnedNetworkId}.`)
            throw unexpectedError
          }

          if (updateAccount && account && normalizeAccount(account) !== normalizeAccount(returnedAccount)) {
            // eslint-disable-next-line no-console
            console.warn(
              `Mismatched accounts in web3ReactUpdateHandler: ${normalizeAccount(account)} and ${normalizeAccount(
                returnedAccount
              )}.`
            )
            throw unexpectedError
          }

          if (fetchNewNetworkId && !fetchNewAccount) {
            dispatchWeb3State({
              payload: { provider: fetchNewProvider ? provider : undefined, networkId: returnedNetworkId },
              type: 'UPDATE_NETWORK_ID'
            })
          } else if (!fetchNewNetworkId && fetchNewAccount) {
            dispatchWeb3State({
              payload: { provider: fetchNewProvider ? provider : undefined, account: returnedAccount },
              type: 'UPDATE_ACCOUNT'
            })
          } else {
            dispatchWeb3State({
              payload: {
                provider: fetchNewProvider ? provider : undefined,
                networkId: returnedNetworkId,
                account: returnedAccount
              },
              type: 'UPDATE_NETWORK_ID_AND_ACCOUNT'
            })
          }
        }
      )
    } catch (error) {
      setError(error)
    }
  }

  function web3ReactErrorHandler(error: Error, preserveConnector: boolean = true): void {
    setError(error, { preserveConnector })
  }

  function web3ReactResetHandler(): void {
    unsetConnector()
  }

  useEffect(
    (): (() => void) => {
      if (activeConnector) {
        activeConnector.on('_web3ReactUpdate', web3ReactUpdateHandler)
        activeConnector.on('_web3ReactError', web3ReactErrorHandler)
        activeConnector.on('_web3ReactReset', web3ReactResetHandler)
      }

      return (): void => {
        if (activeConnector) {
          activeConnector.removeListener('_web3ReactUpdate', web3ReactUpdateHandler)
          activeConnector.removeListener('_web3ReactError', web3ReactErrorHandler)
          activeConnector.removeListener('_web3ReactReset', web3ReactResetHandler)
        }
      }
    }
  )

  return {
    web3Initialized,
    web3State,
    connector: activeConnector,
    setConnector,
    setFirstValidConnector,
    unsetConnector,
    setError
  }
}
