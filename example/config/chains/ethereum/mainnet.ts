import { ethMainChainId } from '../chainIds'
import { ChainConfig } from '../chains.interface'

const chainConfig: ChainConfig = {
  chainId: ethMainChainId,
  name: 'Ethereum',
  nativeCurrency: {
    name: 'Ethers',
    symbol: 'ETH',
    decimals: 18,
  },
  nativeWrappedToken: {
    address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
    decimals: 18,
    symbol: 'WETH',
    name: 'Wrapped ETH',
  },
  rpcUrls: [
    process.env.infuraKey ? `https://mainnet.infura.io/v3/${process.env.infuraKey}` : '',
    process.env.alchemyKey ? `https://eth-mainnet.alchemyapi.io/v2/${process.env.alchemyKey}` : '',
    'https://cloudflare-eth.com',
  ].filter((url) => url !== ''),
  walletConfig: {
    chainName: 'Ethereum',
    iconUrls: [],
    rpcUrls: [],
    blockExplorerUrls: [],
  },
}

export default chainConfig
