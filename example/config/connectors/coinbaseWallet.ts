import type { Web3ReactHooks } from '@web3-react/core-redux'
import type { Web3ReactReduxStore } from '@web3-react/types'
import { initializeConnector } from '@web3-react/core-redux'
import { allAddChainParameters, URLS } from '../../utils/chains'
import { CoinbaseWallet } from '@web3-react/coinbase-wallet'

export const [coinbaseWallet, hooks, store]: [CoinbaseWallet, Web3ReactHooks, Web3ReactReduxStore] =
  initializeConnector<CoinbaseWallet>(
    (actions) =>
      new CoinbaseWallet({
        actions,
        options: {
          url: URLS[1][0],
          appName: 'web3-react',
          reloadOnDisconnect: false,
          darkMode: true,
        },
        connectorOptions: { chainParameters: allAddChainParameters },
      }),
    'Coinbase'
  )
