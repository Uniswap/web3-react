import type { Web3ReactHooks } from '@web3-react/core'
import type { Web3ReactStore } from '@web3-react/types'
import { initializeConnector } from '@web3-react/core'
import { Empty, EMPTY } from '@web3-react/empty'

export const [empty, hooks]: [Empty, Web3ReactHooks, Web3ReactStore] = initializeConnector<Empty>(() => EMPTY)
