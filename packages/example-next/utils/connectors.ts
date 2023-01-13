import type { Connector } from '@web3-react/types'
import { Web3ReactHooks } from '@web3-react/core'
import { MetaMask } from '@web3-react/metamask'
import { CoinbaseWallet } from '@web3-react/coinbase-wallet'
import { WalletConnect } from '@web3-react/walletconnect'
import { BscWallet } from '@web3-react/bsc-wallet'
import { PortisWallet } from '@web3-react/portis-wallet'
import { GnosisSafe } from '@web3-react/gnosis-safe'
import { Network } from '@web3-react/network'
import { TronWallet } from '@web3-react/tron-link'

import { metaMask, hooks as metaMaskHooks } from '../config/connectors/metaMask'
import { coinbaseWallet, hooks as coinbaseWalletHooks } from '../config/connectors/coinbaseWallet'
import { walletConnect, hooks as walletConnectHooks } from '../config/connectors/walletConnect'
import { bscWallet, hooks as bscWalletHooks } from '../config/connectors/bscWallet'
import { portisWallet, hooks as portisWalletHooks } from '../config/connectors/portisWallet'
import { gnosisSafe, hooks as gnosisSafeHooks } from '../config/connectors/gnosisSafe'
import { network, hooks as networkHooks } from '../config/connectors/network'
import { tronWallet, hooks as tronHooks } from '../config/connectors/tronLink'

export type ConnectorType =
  | MetaMask
  | CoinbaseWallet
  | WalletConnect
  | BscWallet
  | PortisWallet
  | GnosisSafe
  | Network
  | TronWallet

export function getName(connector: Connector) {
  if (connector instanceof MetaMask) return 'MetaMask'
  if (connector instanceof CoinbaseWallet) return 'Coinbase Wallet'
  if (connector instanceof WalletConnect) return 'WalletConnect'
  if (connector instanceof BscWallet) return 'BSC Wallet'
  if (connector instanceof PortisWallet) return 'Portis Wallet'
  if (connector instanceof GnosisSafe) return 'Gnosis Safe'
  if (connector instanceof Network) return 'Network'
  if (connector instanceof TronWallet) return 'Tron Link'
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
  [tronWallet, tronHooks],
]

export const connectorInstance = {
  metaMask,
  coinbaseWallet,
  walletConnect,
  bscWallet,
  portisWallet,
  gnosisSafe,
  network,
  tronWallet,
}

export const connectorHooks = {
  metaMask: metaMaskHooks,
  coinbaseWallet: coinbaseWalletHooks,
  walletConnect: walletConnectHooks,
  bscWallet: bscWalletHooks,
  portisWallet: portisWalletHooks,
  gnosisSafe: gnosisSafeHooks,
  network: networkHooks,
  tronLink: tronHooks,
}
