import { initializeConnector } from '@web3-react/core'
import { WalletConnect } from '@web3-react/walletconnect'

import { MAINNET_CHAINS } from '../chains'

export const [walletConnect, hooks] = initializeConnector<WalletConnect>(
  (actions) =>
    new WalletConnect({
      actions,
      options: {
        projectId: process.env.walletConnectProjectId,
        chains: Object.keys(MAINNET_CHAINS).map(Number),
      },
    })
)
