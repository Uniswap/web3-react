import { getImageUrlFromTrust } from '../../../utils/helpers'
import { optimismMainChainId } from '../chainIds'
import { ChainConfig } from '../chains.interface'

const chainConfig: ChainConfig = {
  chainId: optimismMainChainId,
  name: 'Optimism',
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
    process.env.infuraKey ? `https://optimism-mainnet.infura.io/v3/${process.env.infuraKey}` : '',
    'https://forno.optimism.org',
  ].filter((url) => url !== ''),
  walletConfig: {
    chainName: 'Optimism Mainnet',
    iconUrls: [getImageUrlFromTrust(optimismMainChainId)],
    rpcUrls: ['https://forno.optimism.org'],
    blockExplorerUrls: ['https://optimistic.etherscan.io/'],
  },
}

export default chainConfig
