import { createContext, useContext } from 'react'
import invariant from 'tiny-invariant'

import { Web3ReactContextInterface } from './types'

export const Web3ReactContext = createContext<Web3ReactContextInterface>({
  activate: async () => {
    invariant(false, 'No <Web3ReactProvider ... /> found.')
  },
  activateFirst: async () => {
    invariant(false, 'No <Web3ReactProvider ... /> found.')
  },
  setError: () => {
    invariant(false, 'No <Web3ReactProvider ... /> found.')
  },
  deactivate: () => {
    invariant(false, 'No <Web3ReactProvider ... /> found.')
  },
  active: false
})

export function useWeb3React<T = any>(): Web3ReactContextInterface<T> {
  return useContext(Web3ReactContext)
}
