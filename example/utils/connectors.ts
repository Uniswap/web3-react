import type { Connector } from '@web3-react/types'
import { Web3ReactHooks } from '@web3-react/core'
import { MetaMask } from '@web3-react/metamask'
import { CoinbaseWallet } from '@web3-react/coinbase-wallet'
import { WalletConnect } from '@web3-react/walletconnect'
import { BscWallet } from '@web3-react/bsc-wallet'
import { PortisWallet } from '@web3-react/portis-wallet'
import { GnosisSafe } from '@web3-react/gnosis-safe'
import { NamiWallet } from '@web3-react/nami'
import { Network } from '@web3-react/network'
import { TronLink } from '@web3-react/tron-link'
import { PhantomWallet } from '@web3-react/phantom'
import { SolflareWallet } from '@web3-react/solflare'
import { YoroiWallet } from '@web3-react/yoroi'

import { metaMask, hooks as metaMaskHooks } from '../config/connectors/metaMask'
import { coinbaseWallet, hooks as coinbaseWalletHooks } from '../config/connectors/coinbaseWallet'
import { walletConnect, hooks as walletConnectHooks } from '../config/connectors/walletConnect'
import { bscWallet, hooks as bscWalletHooks } from '../config/connectors/bscWallet'
import { portisWallet, hooks as portisWalletHooks } from '../config/connectors/portisWallet'
import { gnosisSafe, hooks as gnosisSafeHooks } from '../config/connectors/gnosisSafe'
import { nami, hooks as namiHooks } from '../config/connectors/nami'
import { network, hooks as networkHooks } from '../config/connectors/network'
import { tronLink, hooks as tronLinkHooks } from '../config/connectors/tronLink'
import { phantom, hooks as phantomHooks } from '../config/connectors/phantom'
import { solflare, hooks as solflareHooks } from '../config/connectors/solflare'
import { yoroi, hooks as yoroiHooks } from '../config/connectors/yoroi'

export function getName(connector: Connector) {
  if (connector instanceof MetaMask) return 'MetaMask'
  if (connector instanceof CoinbaseWallet) return 'Coinbase Wallet'
  if (connector instanceof WalletConnect) return 'WalletConnect'
  if (connector instanceof BscWallet) return 'BSC Wallet'
  if (connector instanceof PortisWallet) return 'Portis Wallet'
  if (connector instanceof GnosisSafe) return 'Gnosis Safe'
  if (connector instanceof NamiWallet) return 'Nami'
  if (connector instanceof Network) return 'Network'
  if (connector instanceof TronLink) return 'Tron Link'
  if (connector instanceof PhantomWallet) return 'Phantom'
  if (connector instanceof SolflareWallet) return 'Solflare'
  if (connector instanceof YoroiWallet) return 'Yoroi'
  return 'Unknown'
}

export function isEVMConnector(connector: Connector): boolean {
  return (
    connector instanceof Network ||
    connector instanceof MetaMask ||
    connector instanceof WalletConnect ||
    connector instanceof PortisWallet
  )
}

export function isSolanaConnector(connector: Connector): boolean {
  return connector instanceof PhantomWallet || connector instanceof SolflareWallet
}

export function isCardanoConnector(connector: Connector): boolean {
  return connector instanceof YoroiWallet || connector instanceof NamiWallet
}

export function isTronConnector(connector: Connector): boolean {
  return connector instanceof TronLink
}

export function isAddableNetwork(connector: Connector): boolean {
  return connector instanceof MetaMask || connector instanceof CoinbaseWallet
}

export function isSwitchableNetwork(connector: Connector): boolean {
  return (
    connector instanceof MetaMask ||
    connector instanceof CoinbaseWallet ||
    connector instanceof PortisWallet ||
    connector instanceof WalletConnect ||
    connector instanceof PhantomWallet ||
    connector instanceof SolflareWallet ||
    connector instanceof Network
  )
}

export const connectors: [Connector, Web3ReactHooks][] = [
  [metaMask, metaMaskHooks],
  [coinbaseWallet, coinbaseWalletHooks],
  [walletConnect, walletConnectHooks],
  [bscWallet, bscWalletHooks],
  [portisWallet, portisWalletHooks],
  [gnosisSafe, gnosisSafeHooks],
  [nami, namiHooks],
  [network, networkHooks],
  [tronLink, tronLinkHooks],
  [phantom, phantomHooks],
  [solflare, solflareHooks],
  [yoroi, yoroiHooks],
]

export const evmConnectors: [Connector, Web3ReactHooks][] = [
  [metaMask, metaMaskHooks],
  [coinbaseWallet, coinbaseWalletHooks],
  [walletConnect, walletConnectHooks],
  [bscWallet, bscWalletHooks],
  [portisWallet, portisWalletHooks],
  [gnosisSafe, gnosisSafeHooks],
  [network, networkHooks],
]

export const solanaConnectors: [Connector, Web3ReactHooks][] = [
  [phantom, phantomHooks],
  [solflare, solflareHooks],
]

export const cardanoConnectors: [Connector, Web3ReactHooks][] = [
  [nami, namiHooks],
  [yoroi, yoroiHooks],
]

export const tronConnectors: [Connector, Web3ReactHooks][] = [[tronLink, tronLinkHooks]]

export const connectorInstance = {
  metaMask,
  coinbaseWallet,
  walletConnect,
  bscWallet,
  portisWallet,
  gnosisSafe,
  nami,
  network,
  tronLink,
  phantom,
  solflare,
  yoroi,
}

export const connectorHooks = {
  metaMask: metaMaskHooks,
  coinbaseWallet: coinbaseWalletHooks,
  walletConnect: walletConnectHooks,
  bscWallet: bscWalletHooks,
  portisWallet: portisWalletHooks,
  gnosisSafe: gnosisSafeHooks,
  nami: namiHooks,
  network: networkHooks,
  tronLink: tronLinkHooks,
  phantom: phantomHooks,
  solflare: solflareHooks,
  yoroi: yoroiHooks,
}
