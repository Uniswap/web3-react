import { getAddress } from '@ethersproject/address'
import type { Actions, Web3ReactState, Web3ReactStateUpdate, Web3ReactStore } from '@web3-react/types'
import create from 'zustand/vanilla'

function validateChainId(chainId: number): void {
  if (!Number.isInteger(chainId) || chainId <= 0 || chainId > Number.MAX_SAFE_INTEGER) {
    throw new Error(`Invalid chainId ${chainId}`)
  }
}

export class ChainIdNotAllowedError extends Error {
  public constructor(chainId: number, allowedChainIds: number[]) {
    super(`chainId ${chainId} not included in ${allowedChainIds}`)
    this.name = ChainIdNotAllowedError.name
    Object.setPrototypeOf(this, ChainIdNotAllowedError.prototype)
  }
}

function ensureChainIdIsAllowed(chainId: number, allowedChainIds: number[]): ChainIdNotAllowedError | undefined {
  return allowedChainIds.some((allowedChainId) => chainId === allowedChainId)
    ? undefined
    : new ChainIdNotAllowedError(chainId, allowedChainIds)
}

function validateAccount(account: string): string {
  return getAddress(account)
}

const DEFAULT_STATE = {
  chainId: undefined,
  accounts: undefined,
  activating: false,
  error: undefined,
}

export function createWeb3ReactStoreAndActions(allowedChainIds?: number[]): [Web3ReactStore, Actions] {
  if (allowedChainIds?.length === 0) {
    throw new Error(`allowedChainIds is length 0`)
  }

  const store = create<Web3ReactState>(() => DEFAULT_STATE)

  function startActivation() {
    store.setState({ ...DEFAULT_STATE, activating: true })
  }

  function update(stateUpdate: Web3ReactStateUpdate) {
    // validate chainId statically, independent of existing state
    if (stateUpdate.chainId !== undefined) {
      validateChainId(stateUpdate.chainId)
    }

    // validate accounts statically, independent of existing state
    if (stateUpdate.accounts !== undefined) {
      for (let i = 0; i < stateUpdate.accounts.length; i++) {
        stateUpdate.accounts[i] = validateAccount(stateUpdate.accounts[i])
      }
    }

    store.setState((existingState): Web3ReactState => {
      let error: Error | undefined

      // calculate the next chainId and accounts
      const chainId = stateUpdate.chainId ?? existingState.chainId
      const accounts = stateUpdate.accounts ?? existingState.accounts

      // if we have a chainId allowlist and a chainId, we need to ensure it's allowed
      if (chainId && allowedChainIds) {
        error = ensureChainIdIsAllowed(chainId, allowedChainIds)
      }

      if (existingState.error && error) {
        console.debug(`error ${existingState.error} is being clobbered by ${error}`)
      }

      // ensure that the activating flag is cleared once fully activated
      let activating = existingState.activating
      if (activating && chainId && accounts) {
        activating = false
      }

      // if error is not defined already, set it to the existing error (if any)
      if (!error) {
        error = existingState.error
        if (error) {
          // if we're here, the heuristic used to clear the error is the same as for clearing the activation flag
          // TODO: this is somewhat arbitrary, could we do more here?
          if (chainId && accounts) {
            error = undefined
          }
        }
      }

      return { chainId, accounts, activating, error }
    })
  }

  function reportError(error: Error) {
    store.setState(() => ({ ...DEFAULT_STATE, error }))
  }

  function reset() {
    store.setState(DEFAULT_STATE)
  }

  return [store, { startActivation, update, reportError, reset }]
}
