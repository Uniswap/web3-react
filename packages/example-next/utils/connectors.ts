import { Web3ReactHooks } from '@web3-react/core'
import type { Connector } from '@web3-react/types'
import { CoinbaseWallet } from '@web3-react/coinbase-wallet'
import { GnosisSafe } from '@web3-react/gnosis-safe'
import { MetaMask } from '@web3-react/metamask'
import { Network } from '@web3-react/network'
import { WalletConnect } from '@web3-react/walletconnect'

import { coinbaseWallet, hooks as coinbaseWalletHooks } from '../config/connectors/coinbaseWallet'
import { gnosisSafe, hooks as gnosisSafeHooks } from '../config/connectors/gnosisSafe'
import { hooks as metaMaskHooks, metaMask } from '../config/connectors/metaMask'
import { hooks as networkHooks, network } from '../config/connectors/network'
import { hooks as walletConnectHooks, walletConnect } from '../config/connectors/walletConnect'

export function getName(connector: Connector) {
  if (connector instanceof MetaMask) return 'MetaMask'
  if (connector instanceof WalletConnect) return 'WalletConnect'
  if (connector instanceof CoinbaseWallet) return 'Coinbase Wallet'
  if (connector instanceof Network) return 'Network'
  if (connector instanceof GnosisSafe) return 'Gnosis Safe'
  return 'Unknown'
}

export const connectors: [MetaMask | WalletConnect | CoinbaseWallet | GnosisSafe | Network, Web3ReactHooks][] = [
  [metaMask, metaMaskHooks],
  [walletConnect, walletConnectHooks],
  [coinbaseWallet, coinbaseWalletHooks],
  [gnosisSafe, gnosisSafeHooks],
  [network, networkHooks],
]
