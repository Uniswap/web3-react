import type { Web3ReactHooks } from '@web3-react/core'
import type { Web3ReactStore } from '@web3-react/types'
import { initializeConnector } from '@web3-react/core'
import { allAddChainParameters, URLS } from '../../utils/chains'
import { CoinbaseWallet } from '@web3-react/coinbase-wallet'

export const [coinbaseWallet, hooks]: [CoinbaseWallet, Web3ReactHooks, Web3ReactStore] =
  initializeConnector<CoinbaseWallet>(
    (actions) =>
      new CoinbaseWallet({
        actions,
        options: {
          url: URLS[1][0],
          appName: 'web3-react',
          reloadOnDisconnect: false,
        },
        connectorOptions: { chainParameters: allAddChainParameters },
      })
  )
