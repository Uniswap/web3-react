import { initializeConnector } from '@web3-react/core'
import { WalletConnect } from '@web3-react/walletconnect-v2'
import { URLS } from '../chains'

export const [walletConnect, hooks] = initializeConnector<WalletConnect>(
  (actions) =>
    new WalletConnect({
      actions,
      options: {
        chainId: 0,
        rpcMap: URLS,
      }
    })
)
