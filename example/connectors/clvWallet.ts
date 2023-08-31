import { initializeConnector } from '@web3-react/core'
import { ClvWallet } from '@web3-react/clvWallet'

export const [clvWallet, hooks] = initializeConnector<ClvWallet>((actions) => new ClvWallet({ actions }))
