import { ethGoerliChainId } from '../chainIds'
import { ChainConfig } from '../chains.interface'

const chainConfig: ChainConfig = {
  chainId: ethGoerliChainId,
  name: 'Görli',
  nativeCurrency: {
    name: 'Ethers',
    symbol: 'ETH',
    decimals: 18,
  },
  nativeWrappedToken: {
    address: '0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6',
    decimals: 18,
    symbol: 'WETH',
    name: 'Wrapped ETH',
  },
  rpcUrls: [process.env.infuraKey ? `https://goerli.infura.io/v3/${process.env.infuraKey}` : ''].filter(
    (url) => url !== ''
  ),
  walletConfig: {
    chainName: 'Görli',
    iconUrls: [],
    rpcUrls: [],
    blockExplorerUrls: [],
  },
}

export default chainConfig
