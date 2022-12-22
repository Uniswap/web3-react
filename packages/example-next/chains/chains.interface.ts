import { AddEthereumChainParameter } from '@web3-react/types'

export interface ChainConfig {
  chainId: number
  name: string
  nativeCurrency: AddEthereumChainParameter['nativeCurrency']
  nativeWrappedTokenInfo: {
    chainId: number
    contractAddress: string
    name: string
    symbol: string
    decimals: number
  }
  rpcUrls: string[]
  walletConfig: {
    chainName: string
    rpcUrls: AddEthereumChainParameter['rpcUrls']
    blockExplorerUrls: AddEthereumChainParameter['blockExplorerUrls']
    iconUrls: AddEthereumChainParameter['iconUrls']
  }
}
