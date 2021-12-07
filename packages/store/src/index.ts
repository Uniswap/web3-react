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

  // flag for tracking updates so we don't clobber data when cancelling activation
  let nullifier = 0

  function startActivation(): () => void {
    const nullifierCached = ++nullifier

    store.setState({ ...DEFAULT_STATE, activating: true })

    // return a function that cancels the activation iff nothing else has happened
    return () => {
      if (nullifier === nullifierCached) {
        store.setState({ ...DEFAULT_STATE, activating: false })
      }
    }
  }

  function update(stateUpdate: Web3ReactStateUpdate): void {
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

    nullifier++

    store.setState((existingState): Web3ReactState => {
      // determine the next chainId and accounts
      const chainId = stateUpdate.chainId ?? existingState.chainId
      const accounts = stateUpdate.accounts ?? existingState.accounts

      // determine the next error
      let error = existingState.error
      if (chainId && allowedChainIds) {
        // if we have a chainId allowlist and a chainId, we need to ensure it's allowed
        const chainIdError = ensureChainIdIsAllowed(chainId, allowedChainIds)

        // warn if we're going to clobber existing error
        if (chainIdError && error) {
          console.debug(`${error} is being clobbered by ${chainIdError}`)
        }

        error = chainIdError
      }

      // ensure that the error is cleared when appropriate
      if (error && !(error instanceof ChainIdNotAllowedError) && chainId && accounts) {
        error = undefined
      }

      // ensure that the activating flag is cleared when appropriate
      let activating = existingState.activating
      if (activating && (error || (chainId && accounts))) {
        activating = false
      }

      return { chainId, accounts, activating, error }
    })
  }

  function reportError(error: Error) {
    nullifier++

    store.setState(() => ({ ...DEFAULT_STATE, error }))
  }

  return [store, { startActivation, update, reportError }]
}
