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
        dispatch({ type: ActionType.UPDATE, payload: normalizeConnectorUpdate(update) })
      } else {
        const renderIdInitial = renderId.current

        try {
          const augmentedUpdate = await augmentConnectorUpdate(connector as AbstractConnectorInterface, update)

          if (renderId.current !== renderIdInitial) {
            throw new StaleConnectorError()
          }

          dispatch({ type: ActionType.UPDATE_FROM_ERROR, payload: augmentedUpdate })
        } catch (error) {
          if (error instanceof StaleConnectorError) {
            warning(false, `Suppressed stale connector update from error state ${connector} ${update}`)
          } else {
            warning(false, `Failed to update from error state because of another error ${connector} ${update} ${error}`)
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
      const renderIdInitial = renderId.current

      try {
        const update = await connector.activate().then(
          (update: ConnectorUpdate): ConnectorUpdate => {
            activated = true
            return update
          }
        )

        const augmentedUpdate = await augmentConnectorUpdate(connector, update)

        if (renderId.current !== renderIdInitial) {
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
          .catch((error: Error): void => {
            warning(false, `Suppressed failed connector activation ${connector}, ${error}`)
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
