import { initializeConnector } from '@web3-react/core'
import { EMPTY, Empty } from '@web3-react/empty'

export const [empty, hooks] = initializeConnector<Empty>(() => EMPTY)
