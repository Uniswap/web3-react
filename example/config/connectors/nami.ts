import type { Web3ReactHooks } from '@web3-react/core'
import { initializeConnector } from '@web3-react/core'
import { NamiWallet } from '@web3-react/nami'
import type { Web3ReactStore } from '@web3-react/types'

export const [nami, hooks]: [NamiWallet, Web3ReactHooks, Web3ReactStore] = initializeConnector<NamiWallet>(
  (actions) => new NamiWallet({ actions })
)
