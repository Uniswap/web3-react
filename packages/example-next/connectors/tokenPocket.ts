import { initializeConnector } from '@web3-react/core'
import { TokenPocket } from '@web3-react/tokenpocket'

export const [tokenPocket, hooks] = initializeConnector<TokenPocket>((actions) => new TokenPocket({ actions }))
