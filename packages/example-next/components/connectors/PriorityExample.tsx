import { getPriorityConnector } from '@web3-react/core'
import { MetaMask } from '@web3-react/metamask'
import { Network } from '@web3-react/network'
import type { Connector } from '@web3-react/types'
import { WalletConnect } from '@web3-react/walletconnect'
import { CoinbaseWalletSDK } from '@web3-react/coinbasewallet'
import { hooks as metaMaskHooks, metaMask } from '../../connectors/metaMask'
import { hooks as networkHooks, network } from '../../connectors/network'
import { hooks as walletConnectHooks, walletConnect } from '../../connectors/walletConnect'
import { hooks as coinbaseWalletHooks, coinbaseWallet } from '../../connectors/coinbaseWallet'

function getName(connector: Connector) {
  if (connector instanceof MetaMask) return 'MetaMask'
  if (connector instanceof WalletConnect) return 'WalletConnect'
  if (connector instanceof CoinbaseWalletSDK) return 'CoinbaseWallet'
  if (connector instanceof Network) return 'Network'
  return 'Unknown'
}

const { usePriorityConnector } = getPriorityConnector(
  [metaMask, metaMaskHooks],
  [walletConnect, walletConnectHooks],
  [coinbaseWallet, coinbaseWalletHooks],
  [network, networkHooks]
)

export default function PriorityExample() {
  const priorityConnector = usePriorityConnector()
  console.log(`Priority Connector: ${getName(priorityConnector)}`)
  return null
}
