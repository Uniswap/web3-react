import type { Web3ReactStore } from '@web3-react/types'
import type { Web3ReactHooks } from '@web3-react/core'
import { initializeConnector } from '@web3-react/core'
import { TronWallet } from '@web3-react/tron-link'

export const [tronWallet, hooks]: [TronWallet, Web3ReactHooks, Web3ReactStore] = initializeConnector<TronWallet>(
  (actions) => new TronWallet({ actions })
)
