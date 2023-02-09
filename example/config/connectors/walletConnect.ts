import type { Web3ReactHooks } from '@web3-react/core'
import { initializeConnector } from '@web3-react/core'
import type { Web3ReactStore } from '@web3-react/types'
import { WalletConnect } from '@web3-react/walletconnect'

import { URLS } from '../../utils/chains'

export const [walletConnect, hooks]: [WalletConnect, Web3ReactHooks, Web3ReactStore] =
  initializeConnector<WalletConnect>(
    (actions) =>
      new WalletConnect({
        actions,
        options: {
          rpc: URLS,
        },
      })
  )
