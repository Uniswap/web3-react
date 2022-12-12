import { CoinbaseWallet } from '@web3-react/coinbase-wallet'
import { GnosisSafe } from '@web3-react/gnosis-safe'
import { MetaMask } from '@web3-react/metamask'
import { Network } from '@web3-react/network'
import { WalletConnect } from '@web3-react/walletconnect'
import { WalletConnect as WalletConnect2 } from '@web3-react/walletconnect-v2'
import type { Connector } from '@web3-react/types'

export function getName(connector: Connector) {
  if (connector instanceof MetaMask) return 'MetaMask'
  if (connector instanceof WalletConnect) return 'WalletConnect'
  if (connector instanceof CoinbaseWallet) return 'Coinbase Wallet'
  if (connector instanceof Network) return 'Network'
  if (connector instanceof GnosisSafe) return 'Gnosis Safe'
  if (connector instanceof WalletConnect2) return 'WalletConnect v2'
  return 'Unknown'
}
