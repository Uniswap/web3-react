import { initializeConnector } from '@web3-react/core'
import { WalletConnect } from '@web3-react/walletconnect'
import { URLS } from './network'

export const [walletConnect, useWalletConnect] = initializeConnector<WalletConnect>(WalletConnect, [
  {
    rpc: { 1: URLS[0] },
  },
])
