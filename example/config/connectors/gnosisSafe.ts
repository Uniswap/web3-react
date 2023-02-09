import type { Web3ReactHooks } from '@web3-react/core'
import type { Web3ReactStore } from '@web3-react/types'
import { initializeConnector } from '@web3-react/core'
import { GnosisSafe } from '@web3-react/gnosis-safe'

export const [gnosisSafe, hooks]: [GnosisSafe, Web3ReactHooks, Web3ReactStore] = initializeConnector<GnosisSafe>(
  (actions) => new GnosisSafe({ actions })
)
