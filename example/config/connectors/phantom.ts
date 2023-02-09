import type { Web3ReactHooks } from '@web3-react/core'
import { initializeConnector } from '@web3-react/core'
import { PhantomWallet } from '@web3-react/phantom'
import type { Web3ReactStore } from '@web3-react/types'

export const [phantom, hooks]: [PhantomWallet, Web3ReactHooks, Web3ReactStore] = initializeConnector<PhantomWallet>(
  (actions) => new PhantomWallet({ actions })
)
