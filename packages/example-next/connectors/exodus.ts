import { initializeConnector } from '@web3-react/core'
import { Exodus } from '@web3-react/exodus'

export const [exodus, hooks] = initializeConnector<Exodus>((actions) => new Exodus({ actions }))
