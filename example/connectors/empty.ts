import { initializeConnector } from '@web3-react/core'
import { Empty, EMPTY } from '@web3-react/empty'

export const [empty, hooks] = initializeConnector<Empty>(() => EMPTY)
