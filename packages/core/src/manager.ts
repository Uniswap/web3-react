import { useReducer, useEffect, useCallback, useRef } from 'react'
import { ConnectorUpdate, ConnectorEvent } from '@web3-react/types'
import { AbstractConnector } from '@web3-react/abstract-connector'
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
  public constructor(unsupportedChainId: number | string, supportedChainIds?: readonly number[]) {
    super()
    this.name = this.constructor.name
    this.message = `Unsupported chain id: ${unsupportedChainId}. Supported chain ids are: ${supportedChainIds}.`
  }
}

interface Web3ReactManagerState {
  connector?: AbstractConnector
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
      const { connector, error } = payload
      return {
        connector,
        error
      }
    }
    case ActionType.DEACTIVATE_CONNECTOR: {
      return {}
    }
  }
}

async function augmentConnectorUpdate(
  connector: AbstractConnector,
  update: ConnectorUpdate
): Promise<ConnectorUpdate<number>> {
  const provider = update.provider === undefined ? await connector.getProvider() : update.provider
  const [_chainId, _account] = (await Promise.all([
    update.chainId === undefined ? connector.getChainId() : update.chainId,
    update.account === undefined ? connector.getAccount() : update.account
  ])) as [Required<ConnectorUpdate>['chainId'], Required<ConnectorUpdate>['account']]

  let chainId: number
  try {
    chainId = normalizeChainId(_chainId)
  } catch {
    throw new UnsupportedChainIdError(_chainId, connector.supportedChainIds);
  }

  if (!!connector.supportedChainIds && !connector.supportedChainIds.includes(chainId)) {
    throw new UnsupportedChainIdError(chainId, connector.supportedChainIds)
  }
  const account = _account === null ? _account : normalizeAccount(_account)

  return { provider, chainId, account }
}

export function useWeb3ReactManager(): Web3ReactManagerReturn {
  const [state, dispatch] = useReducer(reducer, {})
  const { connector, provider, chainId, account, onError, error } = state

  const updateBusterRef = useRef(-1)
  updateBusterRef.current += 1

  const activate = useCallback(
    async (
      connector: AbstractConnector,
      onError?: (error: Error) => void,
      throwErrors: boolean = false
    ): Promise<void> => {
      const updateBusterInitial = updateBusterRef.current

      let activated = false
      try {
        const update = await connector.activate().then(
          (update): ConnectorUpdate => {
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
          activated && connector.deactivate()
          warning(false, `Suppressed stale connector activation ${connector}`)
        } else if (throwErrors) {
          activated && connector.deactivate()
          throw error
        } else if (onError) {
          activated && connector.deactivate()
          onError(error)
        } else {
          // we don't call activated && connector.deactivate() here because it'll be handled in the useEffect
          dispatch({ type: ActionType.ERROR_FROM_ACTIVATION, payload: { connector, error } })
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

  const handleUpdate = useCallback(
    async (update: ConnectorUpdate): Promise<void> => {
      if (!connector) {
        throw Error("This should never happen, it's just so Typescript stops complaining")
      }

      const updateBusterInitial = updateBusterRef.current

      // updates are handled differently depending on whether the connector is active vs in an error state
      if (!error) {
        let chainId: number | undefined
        try {
          chainId = update.chainId === undefined ? undefined : normalizeChainId(update.chainId)
        } catch {
          const error = new UnsupportedChainIdError(
            update.chainId ?? 'unknown',
            connector.supportedChainIds)
          onError ? onError(error) : dispatch({ type: ActionType.ERROR, payload: { error } })
          return
        }
        if (chainId !== undefined && !!connector.supportedChainIds && !connector.supportedChainIds.includes(chainId)) {
          const error = new UnsupportedChainIdError(chainId, connector.supportedChainIds)
          onError ? onError(error) : dispatch({ type: ActionType.ERROR, payload: { error } })
        } else {
          const account = typeof update.account === 'string' ? normalizeAccount(update.account) : update.account
          dispatch({ type: ActionType.UPDATE, payload: { provider: update.provider, chainId, account } })
        }
      } else {
        try {
          const augmentedUpdate = await augmentConnectorUpdate(connector, update)

          if (updateBusterRef.current > updateBusterInitial) {
            throw new StaleConnectorError()
          }
          dispatch({ type: ActionType.UPDATE_FROM_ERROR, payload: augmentedUpdate })
        } catch (error) {
          if (error instanceof StaleConnectorError) {
            warning(false, `Suppressed stale connector update from error state ${connector} ${update}`)
          } else {
            // though we don't have to, we're re-circulating the new error
            onError ? onError(error) : dispatch({ type: ActionType.ERROR, payload: { error } })
          }
        }
      }
    },
    [connector, error, onError]
  )
  const handleError = useCallback(
    (error: Error): void => {
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

  return { connector, provider, chainId, account, activate, setError, deactivate, error }
}
