import { ChainConfig } from '../chains.interface'
import { optimismMainChainId, optimismTestChainId } from '../chainIds'
import { getImageUrlFromTrust } from '../helpers'

const chainConfig: ChainConfig = {
  chainId: optimismTestChainId,
  name: 'Optimism Görli',
  nativeCurrency: {
    name: 'Ether',
    symbol: 'ETH',
    decimals: 18,
  },
  nativeWrappedToken: {
    address: '0x4200000000000000000000000000000000000006',
    decimals: 18,
    symbol: 'WETH',
    name: 'Wrapped ETH',
  },
  rpcUrls: [
    process.env.infuraKey ? `https://optimism-goerli.infura.io/v3/${process.env.infuraKey}` : '',
    'https://goerli.optimism.io',
    'https://alfajores-forno.optimism-testnet.org/',
  ].filter((url) => url !== ''),
  walletConfig: {
    chainName: 'Optimism Görli Testnet',
    iconUrls: [getImageUrlFromTrust(optimismMainChainId)],
    rpcUrls: ['https://goerli.optimism.io', 'https://alfajores-forno.optimism-testnet.org/'],
    blockExplorerUrls: ['https://blockscout.com/optimism/goerli/'],
  },
}

export default chainConfig
