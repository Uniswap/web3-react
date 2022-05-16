import { initializeConnector } from '@web3-react/core'
import { Opera } from '@web3-react/opera'

export const [opera, hooks] = initializeConnector<Opera>((actions) => new Opera(actions))
