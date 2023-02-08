import type { Actions, Web3ReactState, Web3ReactStateUpdate, Web3ReactReduxStore } from '@web3-react/types'
import type { PayloadAction } from '@reduxjs/toolkit'
import { configureStore, createSlice } from '@reduxjs/toolkit'
import { getAddress } from '@ethersproject/address'

/**
 * MAX_SAFE_CHAIN_ID is the upper bound limit on what will be accepted for `chainId`
 * `MAX_SAFE_CHAIN_ID = floor( ( 2**53 - 39 ) / 2 ) = 4503599627370476`
 *
 * @see {@link https://github.com/MetaMask/metamask-extension/blob/b6673731e2367e119a5fee9a454dd40bd4968948/shared/constants/network.js#L31}
 */
export const MAX_SAFE_CHAIN_ID = 4503599627370476

export function validateChainId(chainId: number): void {
  if (!Number.isInteger(chainId) || chainId <= 0 || chainId > MAX_SAFE_CHAIN_ID) {
    throw new Error(`Invalid chainId ${chainId}`)
  }
}

export function validateAccount(account: string): string {
  return getAddress(account)
}
const DEFAULT_STATE: Web3ReactState = {
  chainId: undefined,
  accounts: undefined,
  accountIndex: undefined,
  activating: false,
  addingChain: undefined,
  switchingChain: undefined,
  watchingAsset: undefined,
}

export function createWeb3ReactStoreAndActions(connectorName?: string): [Web3ReactReduxStore, Actions] {
  const web3ReactSlice = createSlice({
    name: connectorName ?? 'Web3React',
    initialState: DEFAULT_STATE,
    reducers: {
      update: (
        existingState: Web3ReactState,
        action: PayloadAction<Web3ReactStateUpdate & { skipValidation?: boolean }>
      ) => {
        const stateUpdate = action.payload

        // validate chainId statically, independent of existing state
        if (stateUpdate.chainId !== undefined && !stateUpdate.skipValidation) {
          validateChainId(stateUpdate.chainId)
        }

        // validate accounts statically, independent of existing state
        if (stateUpdate.accounts !== undefined && !stateUpdate.skipValidation) {
          for (let i = 0; i < stateUpdate.accounts.length; i++) {
            stateUpdate.accounts[i] = validateAccount(stateUpdate.accounts[i])
          }
        }

        // determine the next chainId and accounts
        const chainId = stateUpdate.chainId ?? existingState.chainId
        const accounts = stateUpdate.accounts ?? existingState.accounts

        // ensure that the activating flag is cleared when appropriate
        let activating = stateUpdate.activating ?? existingState.activating
        if (activating && chainId && accounts) {
          activating = false
        }

        // these properties may be set to undefined
        const stateUpdatePropertyNames = Object.getOwnPropertyNames(stateUpdate)

        let accountIndex = stateUpdatePropertyNames.includes('accountIndex')
          ? stateUpdate.accountIndex
          : existingState.accountIndex

        // ensure we assign an account index if there are accounts
        if (!accountIndex && !!accounts?.length) {
          accountIndex = 0
        }

        const addingChain = stateUpdatePropertyNames.includes('addingChain')
          ? stateUpdate.addingChain
          : existingState.addingChain
        const switchingChain = stateUpdatePropertyNames.includes('switchingChain')
          ? stateUpdate.switchingChain
          : existingState.switchingChain
        const watchingAsset = stateUpdatePropertyNames.includes('watchingAsset')
          ? stateUpdate.watchingAsset
          : existingState.watchingAsset

        existingState = {
          chainId,
          accountIndex,
          accounts,
          activating,
          addingChain,
          switchingChain,
          watchingAsset,
        }

        return existingState
      },

      resetState: (existingState: Web3ReactState) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        existingState = DEFAULT_STATE

        return existingState
      },
    },
  })

  const store = configureStore({ reducer: web3ReactSlice.reducer, devTools: { name: connectorName } })

  const { update, resetState } = web3ReactSlice.actions

  const actions: Actions = {
    startActivation: (): (() => Web3ReactState) => {
      store.dispatch(update({ activating: true }))

      // return a function that cancels the activation if nothing else has happened
      return (): Web3ReactState => {
        store.dispatch(update({ activating: false, addingChain: undefined, switchingChain: undefined }))

        return store.getState()
      }
    },
    update: (stateUpdate: Web3ReactStateUpdate, skipValidation?: boolean) => {
      store.dispatch(update({ ...stateUpdate, skipValidation }))

      return store.getState()
    },
    resetState: () => {
      store.dispatch(resetState())
      return store.getState()
    },
    getState: () => store.getState(),
  }

  return [store, actions]
}
