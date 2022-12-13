import { initializeConnector } from '@web3-react/core'
import { WalletConnect } from '@web3-react/walletconnect-v2'
import { URLS } from '../chains'

export const [walletConnect, hooks] = initializeConnector<WalletConnect>(
  (actions) =>
    new WalletConnect({
      options: {
        projectId: "fddf170390830523efae43b403c57f48",
        rpcMap: URLS,
      },
      actions,
    })
)