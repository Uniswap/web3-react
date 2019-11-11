import { createContext } from 'react'

import { Web3ReactContext } from './types'

export default createContext<Web3ReactContext>({
  activate: async () => {
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
