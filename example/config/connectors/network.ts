import type { Web3ReactHooks } from '@web3-react/core'
import { initializeConnector } from '@web3-react/core'
import { Network } from '@web3-react/network'
import type { Web3ReactStore } from '@web3-react/types'

import { URLS } from '../../utils/chains'

export const [network, hooks]: [Network, Web3ReactHooks, Web3ReactStore] = initializeConnector<Network>(
  (actions) => new Network({ actions, urlMap: URLS })
)
