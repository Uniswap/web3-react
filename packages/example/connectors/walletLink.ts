import { initializeConnector } from '@web3-react/core'
import { WalletLink } from '@web3-react/walletlink'
import { URLS } from './network'

export const [walletLink, useWalletLink] = initializeConnector<WalletLink>(WalletLink, [
  {
    url: URLS[0],
  },
])
