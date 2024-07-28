import { initializeConnector } from '@web3-react/core'

import { TrustWallet } from '../../packages/trust/dist/index'

export const [trustWallet, hooks] = initializeConnector<TrustWallet>((actions) => new TrustWallet({ actions }))