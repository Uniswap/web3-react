import { initializeConnector } from '@web3-react/core'

import { OKXWallet } from '../../packages/okx/dist/index'

export const [okxWallet, hooks] = initializeConnector<OKXWallet>((actions) => new OKXWallet({ actions }))