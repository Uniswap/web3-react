import { initializeConnector } from '@web3-react/core'
import { CoreWallet } from '@web3-react/core-wallet'

export const [coreWallet, hooks] = initializeConnector<CoreWallet>((actions) => new CoreWallet({ actions }))
