import { initializeConnector } from '@web3-react/core'
import { TallyHo } from '@web3-react/tally-ho'

export const [tallyHo, hooks] = initializeConnector<TallyHo>((actions) => new TallyHo(actions, false))
