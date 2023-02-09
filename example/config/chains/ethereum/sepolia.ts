import { ethSepoliaChainId } from '../chainIds'
import { ChainConfig } from '../chains.interface'

const chainConfig: ChainConfig = {
  chainId: ethSepoliaChainId,
  name: 'Sepolia',
  nativeCurrency: {
    name: 'Ethers',
    symbol: 'ETH',
    decimals: 18,
  },
  nativeWrappedToken: {
    address: '0xb16F35c0Ae2912430DAc15764477E179D9B9EbEa',
    decimals: 18,
    symbol: 'WETH',
    name: 'Wrapped ETH',
  },
  rpcUrls: [process.env.infuraKey ? `https://sepolia.infura.io/v3/${process.env.infuraKey}` : ''].filter(
    (url) => url !== ''
  ),
  walletConfig: {
    chainName: 'Sepolia',
    iconUrls: [],
    rpcUrls: [],
    blockExplorerUrls: [],
  },
}

export default chainConfig
