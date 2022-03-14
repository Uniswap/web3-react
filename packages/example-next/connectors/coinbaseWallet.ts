import { initializeConnector } from '@web3-react/core'
import { CoinbaseWalletSDK } from '@web3-react/coinbasewallet'
import { URLS } from '../chains'

export const [coinbaseWalletSDK, hooks] = initializeConnector<CoinbaseWalletSDK>(
  (actions) =>
    new CoinbaseWalletSDK(actions, {
      url: URLS[1][0],
      appName: 'web3-react',
    })
)
