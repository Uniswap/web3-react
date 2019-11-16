import { useReducer, useEffect, useCallback, useRef } from 'react'
import { AbstractConnectorInterface, ConnectorUpdate, ConnectorEvent } from '@web3-react/types'
import warning from 'tiny-warning'

import { Web3ReactManagerReturn } from './types'
import { normalizeChainId, normalizeAccount } from './normalizers'

class StaleConnectorError extends Error {
  constructor() {
    super()
    this.name = this.constructor.name
  }
}

export class UnsupportedChainIdError extends Error {
  public constructor(unsupportedChainId: number, supportedChainIds?: readonly number[]) {
    super()
    this.name = this.constructor.name
    this.message = `Unsupported chain id: ${unsupportedChainId}. Supported chain ids are: ${supportedChainIds}.`
  }
}

interface Web3ReactManagerState {
  updateBuster: number

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

function reducer(state: Web3ReactManagerState, { type, payload }: Action): Web3ReactManagerState {
  const { updateBuster } = state

  switch (type) {
    case ActionType.ACTIVATE_CONNECTOR: {
      const { connector, provider, chainId, account, onError } = payload
      return { updateBuster: updateBuster + 1, connector, provider, chainId, account, onError }
    }
    case ActionType.UPDATE: {
      const { provider, chainId, account } = payload
      return {
        ...state,
        updateBuster: updateBuster + 1,
        ...(provider === undefined ? {} : { provider }),
        ...(chainId === undefined ? {} : { chainId }),
        ...(account === undefined ? {} : { account })
      }
    }
    case ActionType.UPDATE_FROM_ERROR: {
      const { provider, chainId, account } = payload
      return {
        ...state,
        updateBuster: updateBuster + 1,
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
        updateBuster: updateBuster + 1,
        connector,
        error,
        onError
      }
    }
    case ActionType.ERROR_FROM_ACTIVATION: {
      const { connector, onError, error } = payload
      return {
        updateBuster: updateBuster + 1,
        connector,
        error,
        onError
      }
    }
    case ActionType.DEACTIVATE_CONNECTOR: {
      return { updateBuster: updateBuster + 1 }
    }
  }
}

function normalizeConnectorUpdate(update: ConnectorUpdate): ConnectorUpdate<number> {
  return {
    provider: update.provider,
    chainId: update.chainId === undefined ? undefined : normalizeChainId(update.chainId),
    account: typeof update.account === 'string' ? normalizeAccount(update.account) : update.account
  }
}

async function augmentConnectorUpdate(
  connector: AbstractConnectorInterface,
  update: ConnectorUpdate
): Promise<ConnectorUpdate<number>> {
  const provider = update.provider === undefined ? await connector.getProvider() : update.provider
  const [_chainId, _account]: any = await Promise.all([
    update.chainId === undefined ? connector.getChainId() : update.chainId,
    update.account === undefined ? connector.getAccount() : update.account
  ])

  const chainId = normalizeChainId(_chainId)
  if (connector.supportedChainIds && !connector.supportedChainIds.includes(chainId)) {
    throw new UnsupportedChainIdError(chainId, connector.supportedChainIds)
  }
  const account = _account === null ? _account : normalizeAccount(_account)

  return { provider, chainId, account }
}

export function useWeb3ReactManager(): Web3ReactManagerReturn {
  const [state, dispatch] = useReducer(reducer, { updateBuster: 0 })
  const { updateBuster, connector, provider, chainId, account, onError, error } = state
  const updateBusterRef = useRef(updateBuster)
  updateBusterRef.current = updateBuster

  const handleUpdate = useCallback(
    async (update: ConnectorUpdate): Promise<void> => {
      // updates are handled differently depending on whether the connector is active vs in an error state
      if (!error) {
        dispatch({ type: ActionType.UPDATE, payload: normalizeConnectorUpdate(update) })
      } else {
        try {
          const augmentedUpdate = await augmentConnectorUpdate(connector as AbstractConnectorInterface, update)

          if (updateBusterRef.current > updateBuster) {
            throw new StaleConnectorError()
          }

          dispatch({ type: ActionType.UPDATE_FROM_ERROR, payload: augmentedUpdate })
        } catch (error) {
          if (error instanceof StaleConnectorError) {
            warning(false, `Suppressed stale connector update from error state ${connector} ${update}`)
          } else {
            // though it's an option, we don't update the error here
            warning(false, `Failed to update from error state because of another error ${connector} ${update} ${error}`)
          }
        }
      }
    },
    [error, connector, updateBuster]
  )
  const handleError = useCallback(
    (error: Error): void => {
      // bail from setting the error if an onError function was passed
      onError ? onError(error) : dispatch({ type: ActionType.ERROR, payload: { error } })
    },
    [onError]
  )
  const handleDeactivate = useCallback((): void => {
    dispatch({ type: ActionType.DEACTIVATE_CONNECTOR })
  }, [])

  // ensure that connectors which were set are deactivated
  useEffect((): (() => void) => {
    return () => {
      if (connector) {
        connector.deactivate()
      }
    }
  }, [connector])

  // ensure that events emitted from the set connector are handled appropriately
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
      // this is a different pattern than in handleUpdate because we want activate to maintain identity
      const updateBusterInitial = updateBusterRef.current
      let activated = false

      try {
        const update = await connector.activate().then(
          (update: ConnectorUpdate): ConnectorUpdate => {
            activated = true
            return update
          }
        )

        const augmentedUpdate = await augmentConnectorUpdate(connector, update)

        if (updateBusterRef.current > updateBusterInitial) {
          throw new StaleConnectorError()
        }

        dispatch({ type: ActionType.ACTIVATE_CONNECTOR, payload: { connector, ...augmentedUpdate, onError } })
      } catch (error) {
        if (error instanceof StaleConnectorError) {
          if (activated) {
            connector.deactivate()
          }
          warning(false, `Suppressed stale connector activation ${connector}`)
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

  const setError = useCallback((error: Error): void => {
    dispatch({ type: ActionType.ERROR, payload: { error } })
  }, [])

  const deactivate = useCallback((): void => {
    dispatch({ type: ActionType.DEACTIVATE_CONNECTOR })
  }, [])

  return { connector, provider, chainId, account, activate, setError, deactivate, error }
}
