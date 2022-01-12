import { initializeConnector } from '@web3-react/core'
import { Magic } from '@web3-react/magic'

export const [magic, hooks, store] = initializeConnector<Magic>(
  (actions) =>
    new Magic(actions, {
      apiKey: process.env.magicKey,
    })
)
