import { initializeConnector } from '@web3-react/core'
import { WalletLink } from '@web3-react/walletlink'
import { URLS } from '../chains'

export const [walletLink, hooks] = initializeConnector<WalletLink>(
  (actions) =>
    new WalletLink(actions, {
      url: URLS[1][0],
      appName: 'web3-react',
    })
)
