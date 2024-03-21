import { initializeConnector } from '@web3-react/core'
// import { XDEFIWallet } from '@web3-react/xdefi'
import { XDEFIWallet } from '../../packages/xdefi/dist/index'

export const [xdefiWallet, hooks] = initializeConnector<XDEFIWallet>((actions) => new XDEFIWallet({ actions }))