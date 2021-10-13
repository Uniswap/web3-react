import { initializeConnector } from '@web3-react/core'
import { Magic } from '@web3-react/magic'

export const [magic, useMagic] = initializeConnector<Magic>(Magic, [
  {
    apiKey: process.env.magicKey,
  },
])
