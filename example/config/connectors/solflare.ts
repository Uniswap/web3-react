import type { Web3ReactHooks } from '@web3-react/core'
import { initializeConnector } from '@web3-react/core'
import { SolflareWallet } from '@web3-react/solflare'
import type { Web3ReactStore } from '@web3-react/types'

export const [solflare, hooks]: [SolflareWallet, Web3ReactHooks, Web3ReactStore] = initializeConnector<SolflareWallet>(
  (actions) => new SolflareWallet({ actions })
)
