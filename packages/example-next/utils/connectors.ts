import type { Connector } from '@web3-react/types'
import { Web3ReactHooks } from '@web3-react/core'
import { MetaMask } from '@web3-react/metamask'
import { CoinbaseWallet } from '@web3-react/coinbase-wallet'
import { WalletConnect } from '@web3-react/walletconnect'
import { BscWallet } from '@web3-react/bsc-wallet'
import { PortisWallet } from '@web3-react/portis-wallet'
import { GnosisSafe } from '@web3-react/gnosis-safe'
import { Network } from '@web3-react/network'

import { metaMask, hooks as metaMaskHooks } from '../config/connectors/metaMask'
import { coinbaseWallet, hooks as coinbaseWalletHooks } from '../config/connectors/coinbaseWallet'
import { walletConnect, hooks as walletConnectHooks } from '../config/connectors/walletConnect'
import { bscWallet, hooks as bscWalletHooks } from '../config/connectors/bscWallet'
import { portisWallet, hooks as portisWalletHooks } from '../config/connectors/portisWallet'
import { gnosisSafe, hooks as gnosisSafeHooks } from '../config/connectors/gnosisSafe'
import { hooks as networkHooks, network } from '../config/connectors/network'

export type ConnectorType = MetaMask | CoinbaseWallet | WalletConnect | BscWallet | PortisWallet | GnosisSafe | Network

export function getName(connector: Connector) {
  if (connector instanceof MetaMask) return 'MetaMask'
  if (connector instanceof CoinbaseWallet) return 'Coinbase Wallet'
  if (connector instanceof WalletConnect) return 'WalletConnect'
  if (connector instanceof BscWallet) return 'BSC Wallet'
  if (connector instanceof PortisWallet) return 'Portis Wallet'
  if (connector instanceof GnosisSafe) return 'Gnosis Safe'
  if (connector instanceof Network) return 'Network'
  return 'Unknown'
}

export const connectors: [ConnectorType, Web3ReactHooks][] = [
  [metaMask, metaMaskHooks],
  [coinbaseWallet, coinbaseWalletHooks],
  [walletConnect, walletConnectHooks],
  [bscWallet, bscWalletHooks],
  [portisWallet, portisWalletHooks],
  [gnosisSafe, gnosisSafeHooks],
  [network, networkHooks],
]

export const connectorInstance = {
  metaMask,
  coinbaseWallet,
  walletConnect,
  bscWallet,
  portisWallet,
  gnosisSafe,
  network,
}

export const connectorHooks = {
  metaMask: metaMaskHooks,
  coinbaseWallet: coinbaseWalletHooks,
  walletConnect: walletConnectHooks,
  bscWallet: bscWalletHooks,
  portisWallet: portisWalletHooks,
  gnosisSafe: gnosisSafeHooks,
  network: networkHooks,
}
