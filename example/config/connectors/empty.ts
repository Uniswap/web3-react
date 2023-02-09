import type { Web3ReactHooks } from '@web3-react/core'
import { initializeConnector } from '@web3-react/core'
import { EMPTY, Empty } from '@web3-react/empty'
import type { Web3ReactStore } from '@web3-react/types'

export const [empty, hooks]: [Empty, Web3ReactHooks, Web3ReactStore] = initializeConnector<Empty>(() => EMPTY)
