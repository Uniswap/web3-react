import { initializeConnector } from '@web3-react/core'
import { Sequence } from '@web3-react/sequence'

export const [sequence, hooks] = initializeConnector<Sequence>((actions) => new Sequence(actions))
