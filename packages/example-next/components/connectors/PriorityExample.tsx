import { CoinbaseWallet } from '@web3-react/coinbase-wallet'
import { getPriorityConnector, useWeb3React } from '@web3-react/core'
import { MetaMask } from '@web3-react/metamask'
import { Network } from '@web3-react/network'
import type { Connector } from '@web3-react/types'
import { WalletConnect } from '@web3-react/walletconnect'
import { coinbaseWallet, hooks as coinbaseWalletHooks } from '../../connectors/coinbaseWallet'
import { hooks as metaMaskHooks, metaMask } from '../../connectors/metaMask'
import { hooks as networkHooks, network } from '../../connectors/network'
import { hooks as walletConnectHooks, walletConnect } from '../../connectors/walletConnect'

function getName(connector: Connector) {
  if (connector instanceof MetaMask) return 'MetaMask'
  if (connector instanceof WalletConnect) return 'WalletConnect'
  if (connector instanceof CoinbaseWallet) return 'Coinbase Wallet'
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
  const { chainId } = useWeb3React()

  console.log({ chainId })
  const priorityConnector = usePriorityConnector()
  console.log(`Priority Connector is : ${getName(priorityConnector)}`)
  return null
}
