import { useReducer, useEffect, useCallback, useRef } from 'react'
import { AbstractConnectorInterface, ConnectorUpdate, ConnectorEvent } from '@web3-react/types'

import { Web3ReactManagerReturn } from './types'

class StaleConnectorError extends Error {
  constructor() {
    super()
    this.name = this.constructor.name
  }
}

interface Web3ReactManagerState {
  connector?: AbstractConnectorInterface
  provider?: any
  chainId?: number
  account?: null | string

  onError?: (error: Error) => void

  error?: Error
}

enum ActionType {
  ACTIVATE_CONNECTOR,
  UPDATE,
  UPDATE_FROM_ERROR,
  ERROR,
  ERROR_FROM_ACTIVATION,
  DEACTIVATE_CONNECTOR
}

interface Action {
  type: ActionType
  payload?: any
}

function initializer(): Web3ReactManagerState {
  return {}
}

function reducer(state: Web3ReactManagerState, { type, payload }: Action): Web3ReactManagerState {
  switch (type) {
    case ActionType.ACTIVATE_CONNECTOR: {
      const { connector, provider, chainId, account, onError } = payload
      return { connector, provider, chainId, account, onError }
    }
    case ActionType.UPDATE: {
      const { provider, chainId, account } = payload
      return {
        ...state,
        ...(provider === undefined ? {} : { provider }),
        ...(chainId === undefined ? {} : { chainId }),
        ...(account === undefined ? {} : { account })
      }
    }
    case ActionType.UPDATE_FROM_ERROR: {
      const { provider, chainId, account } = payload
      return {
        ...state,
        ...(provider === undefined ? {} : { provider }),
        ...(chainId === undefined ? {} : { chainId }),
        ...(account === undefined ? {} : { account }),
        error: undefined
      }
    }
    case ActionType.ERROR: {
      const { error } = payload
      const { connector, onError } = state
      return {
        connector,
        error,
        onError
      }
    }
    case ActionType.ERROR_FROM_ACTIVATION: {
      const { connector, onError, error } = payload
      return {
        connector,
        error,
        onError
      }
    }
    case ActionType.DEACTIVATE_CONNECTOR: {
      return initializer()
    }
  }
}

export default function Web3ReactManager(): Web3ReactManagerReturn {
  const [{ connector, provider, chainId, account, onError, error }, dispatch] = useReducer(
    reducer,
    undefined,
    initializer
  )
  const renderId = useRef(0)
  renderId.current++

  const handleUpdate = useCallback(
    async (update: ConnectorUpdate): Promise<void> => {
      if (!error) {
        dispatch({ type: ActionType.UPDATE, payload: update })
      } else {
        const renderIdInitial = renderId.current

        try {
          const provider =
            update.provider === undefined
              ? await (connector as AbstractConnectorInterface).getProvider()
              : update.provider
          const chainId =
            update.chainId === undefined ? await (connector as AbstractConnectorInterface).getChainId() : update.chainId
          const account =
            update.account === undefined ? await (connector as AbstractConnectorInterface).getAccount() : update.account

          if (renderId.current !== renderIdInitial) {
            throw new StaleConnectorError()
          }

          dispatch({ type: ActionType.UPDATE_FROM_ERROR, payload: { provider, chainId, account } })
        } catch (error) {
          if (error instanceof StaleConnectorError) {
            if (__DEV__) {
              console.warn('Suppressed stale connector update from error state', connector, update)
            }
          } else {
            if (__DEV__) {
              console.warn('Failed to fully update from error state', connector, update, error)
            }
          }
        }
      }
    },
    [error, connector]
  )
  const handleError = useCallback(
    (error: Error): void => {
      if (!onError) {
        dispatch({ type: ActionType.ERROR, payload: { error } })
      } else {
        onError(error)
      }
    },
    [onError]
  )
  const handleDeactivate = useCallback((): void => {
    dispatch({ type: ActionType.DEACTIVATE_CONNECTOR })
  }, [])

  useEffect((): (() => void) => {
    return () => {
      if (connector) {
        connector.deactivate()
      }
    }
  }, [connector])

  useEffect((): (() => void) => {
    if (connector) {
      connector
        .on(ConnectorEvent.Update, handleUpdate)
        .on(ConnectorEvent.Error, handleError)
        .on(ConnectorEvent.Deactivate, handleDeactivate)
    }

    return () => {
      if (connector) {
        connector
          .off(ConnectorEvent.Update, handleUpdate)
          .off(ConnectorEvent.Error, handleError)
          .off(ConnectorEvent.Deactivate, handleDeactivate)
      }
    }
  }, [connector, handleUpdate, handleError, handleDeactivate])

  const activate = useCallback(
    async (
      connector: AbstractConnectorInterface,
      onError?: (error: Error) => void,
      throwErrors: boolean = false
    ): Promise<void> => {
      let activated = false

      try {
        const renderIdInitial = renderId.current

        const update = await connector.activate().then(
          (update: ConnectorUpdate): ConnectorUpdate => {
            activated = true
            return update
          }
        )
        const provider = update.provider === undefined ? await connector.getProvider() : update.provider
        const chainId = update.chainId === undefined ? await connector.getChainId() : update.chainId
        const account = update.account === undefined ? await connector.getAccount() : update.account

        if (renderId.current !== renderIdInitial) {
          throw new StaleConnectorError()
        }

        dispatch({ type: ActionType.ACTIVATE_CONNECTOR, payload: { connector, provider, chainId, account, onError } })
      } catch (error) {
        if (error instanceof StaleConnectorError) {
          if (activated) {
            connector.deactivate()
          }
          if (__DEV__) {
            console.warn('Suppressed stale connector activation', connector)
          }
        } else {
          if (throwErrors) {
            if (activated) {
              connector.deactivate()
            }
            throw error
          } else {
            if (onError) {
              if (activated) {
                connector.deactivate()
              }
              onError(error)
            } else {
              dispatch({ type: ActionType.ERROR_FROM_ACTIVATION, payload: { connector, onError, error } })
            }
          }
        }
      }
    },
    []
  )

  const activateFirst = useCallback(
    async (
      connectors: AbstractConnectorInterface[],
      onError?: (error: Error) => void,
      throwErrors: boolean = false
    ): Promise<void> => {
      let success = false
      for (let connector of connectors.slice(0, -1)) {
        if (success) {
          break
        }
        await activate(connector, onError, true)
          // eslint-disable-next-line no-loop-func
          .then((): void => {
            success = true
          })
          // eslint-disable-next-line no-loop-func
          .catch((): void => {
            if (__DEV__) {
              console.info('Suppressed failed connector activation', connector)
            }
          })
      }

      if (!success) {
        await activate(connectors.slice(-1)[0], onError, throwErrors)
      }
    },
    [activate]
  )

  const setError = useCallback((error: Error): void => {
    dispatch({ type: ActionType.ERROR, payload: { error } })
  }, [])

  const deactivate = useCallback((): void => {
    dispatch({ type: ActionType.DEACTIVATE_CONNECTOR })
  }, [])

  return { connector, provider, chainId, account, activate, activateFirst, setError, deactivate, error }
}
