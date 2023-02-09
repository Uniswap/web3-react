import type { Web3ReactHooks } from '@web3-react/core'
import { initializeConnector } from '@web3-react/core'
import { TronLink } from '@web3-react/tron-link'
import type { Web3ReactStore } from '@web3-react/types'

export const [tronLink, hooks]: [TronLink, Web3ReactHooks, Web3ReactStore] = initializeConnector<TronLink>(
  (actions) => new TronLink({ actions })
)
