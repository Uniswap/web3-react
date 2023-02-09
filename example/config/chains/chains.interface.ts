import { AddEthereumChainParameter } from '@web3-react/types'

export interface ChainConfig {
  chainId: number
  name: string
  rpcUrls: string[]
  nativeCurrency: AddEthereumChainParameter['nativeCurrency']
  nativeWrappedToken?: {
    address: string
    name: string
    symbol: string
    decimals: number
  }
  walletConfig: {
    chainName: AddEthereumChainParameter['chainName']
    rpcUrls: AddEthereumChainParameter['rpcUrls']
    blockExplorerUrls: AddEthereumChainParameter['blockExplorerUrls']
    iconUrls: AddEthereumChainParameter['iconUrls']
  }
}
