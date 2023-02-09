import { BscWallet } from '@web3-react/bsc-wallet'
import type { Web3ReactHooks } from '@web3-react/core'
import { initializeConnector } from '@web3-react/core'
import type { Web3ReactStore } from '@web3-react/types'

export const [bscWallet, hooks]: [BscWallet, Web3ReactHooks, Web3ReactStore] = initializeConnector<BscWallet>(
  (actions) => new BscWallet({ actions })
)
