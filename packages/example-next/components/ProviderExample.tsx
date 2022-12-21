import { CoinbaseWallet } from '@web3-react/coinbase-wallet'
import { Web3ReactHooks, Web3ReactProvider } from '@web3-react/core'
import { GnosisSafe } from '@web3-react/gnosis-safe'
import { MetaMask } from '@web3-react/metamask'
import { Network } from '@web3-react/network'
import { WalletConnect } from '@web3-react/walletconnect'
import { coinbaseWallet, hooks as coinbaseWalletHooks } from '../connectors/coinbaseWallet'
import { gnosisSafe, hooks as gnosisSafeHooks } from '../connectors/gnosisSafe'
import { hooks as metaMaskHooks, metaMask } from '../connectors/metaMask'
import { hooks as networkHooks, network } from '../connectors/network'
import { hooks as walletConnectHooks, walletConnect } from '../connectors/walletConnect'

const connectors: [MetaMask | WalletConnect | CoinbaseWallet | GnosisSafe | Network, Web3ReactHooks][] = [
  [metaMask, metaMaskHooks],
  [walletConnect, walletConnectHooks],
  [coinbaseWallet, coinbaseWalletHooks],
  [gnosisSafe, gnosisSafeHooks],
  [network, networkHooks],
]
export default function ProviderExample({ children }) {
  return <Web3ReactProvider connectors={connectors}>{children}</Web3ReactProvider>
}
