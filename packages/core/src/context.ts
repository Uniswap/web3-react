import { createContext, useContext } from 'react'

import { Web3ReactContextInterface } from './types'

export const Web3ReactContext = createContext<Web3ReactContextInterface>({
  activate: async () => {
    console.error('No <Web3ReactProvider ... /> found.')
  },
  activateFirst: async () => {
    console.error('No <Web3ReactProvider ... /> found.')
  },
  setError: () => {
    console.error('No <Web3ReactProvider ... /> found.')
  },
  deactivate: () => {
    console.error('No <Web3ReactProvider ... /> found.')
  },
  active: false
})

export function useWeb3React() {
  return useContext(Web3ReactContext)
}
