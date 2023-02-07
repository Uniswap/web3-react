import { initializeConnector } from '@web3-react/core'
import { WalletConnect } from '@web3-react/walletconnect'
import { MAINNET_CHAINS } from '../chains'

export const [walletConnect, hooks] = initializeConnector<WalletConnect>(
  (actions) =>
    new WalletConnect({
      actions,
      options: {
        projectId: 'a6cc11517a10f6f12953fd67b1eb67e7',
        chains: Object.keys(MAINNET_CHAINS).map(Number),
      },
    })
)
