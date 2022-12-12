import { initializeConnector } from '@web3-react/core'
import { WalletConnect } from '@web3-react/walletconnect-v2'

export const [walletConnect, hooks] = initializeConnector<WalletConnect>(
  (actions) =>
    new WalletConnect({
      actions,
    })
)
