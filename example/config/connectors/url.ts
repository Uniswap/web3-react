import type { Web3ReactHooks } from '@web3-react/core'
import { initializeConnector } from '@web3-react/core'
import type { Web3ReactStore } from '@web3-react/types'
import { Url } from '@web3-react/url'

import { URLS } from '../../utils/chains'

export const [url, hooks]: [Url, Web3ReactHooks, Web3ReactStore] = initializeConnector<Url>(
  (actions) => new Url({ actions, url: URLS[1][0] })
)
