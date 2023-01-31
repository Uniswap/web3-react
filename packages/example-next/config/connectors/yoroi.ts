import type { Web3ReactStore } from '@web3-react/types'
import type { Web3ReactHooks } from '@web3-react/core'
import { initializeConnector } from '@web3-react/core'
import { YoroiWallet } from '@web3-react/yoroi'

export const [yoroi, hooks]: [YoroiWallet, Web3ReactHooks, Web3ReactStore] = initializeConnector<YoroiWallet>(
  (actions) => new YoroiWallet({ actions })
)
