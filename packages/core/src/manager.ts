import { useReducer, useEffect, useCallback, useRef } from 'react'
import { ConnectorUpdate, ConnectorEvent } from '@web3-react/types'
import { AbstractConnector } from '@web3-react/abstract-connector'

import { Web3ReactManagerReturn } from './types'

class StaleConnectorError extends Error {
  constructor() {
    super()
    this.name = this.constructor.name
  }
}

interface State {
  connector?: AbstractConnector
  provider?: any
  chainId?: number
  account?: null | string
  error?: Error
  onError?: (error: Error) => void
}

function initializer(): State {
  return {}
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

function reducer(state: State, { type, payload }: Action): State {
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
            update.provider === undefined ? await (connector as AbstractConnector).getProvider() : update.provider
          const chainId =
            update.chainId === undefined ? await (connector as AbstractConnector).getChainId(provider) : update.chainId
          const account =
            update.account === undefined ? await (connector as AbstractConnector).getAccount(provider) : update.account

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
            dispatch({ type: ActionType.UPDATE, payload: update })
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

  const activate = useCallback(async (connector: AbstractConnector, onError?: (error: Error) => void): Promise<
    void
  > => {
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
      const chainId = update.chainId === undefined ? await connector.getChainId(provider) : update.chainId
      const account = update.account === undefined ? await connector.getAccount(provider) : update.account

      if (renderId.current !== renderIdInitial) {
        throw new StaleConnectorError()
      }

      dispatch({ type: ActionType.ACTIVATE_CONNECTOR, payload: { connector, provider, chainId, account, onError } })
    } catch (error) {
      if (activated) {
        connector.deactivate()
      }

      if (error instanceof StaleConnectorError) {
        if (__DEV__) {
          console.warn('Suppressed stale connector activation', connector)
        }
      } else {
        if (onError) {
          onError(error)
        } else {
          dispatch({ type: ActionType.ERROR_FROM_ACTIVATION, payload: { connector, onError, error } })
        }
      }
    }
  }, [])

  const setError = useCallback((error: Error): void => {
    dispatch({ type: ActionType.ERROR, payload: { error } })
  }, [])

  const deactivate = useCallback((): void => {
    dispatch({ type: ActionType.DEACTIVATE_CONNECTOR })
  }, [])

  return { connector, provider, chainId, account, activate, setError, deactivate }
}
