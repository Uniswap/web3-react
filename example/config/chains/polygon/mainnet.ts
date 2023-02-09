import { getImageUrlFromTrust } from '../../../utils/helpers'
import { polygonMainChainId } from '../chainIds'
import { ChainConfig } from '../chains.interface'

const chainConfig: ChainConfig = {
  chainId: polygonMainChainId,
  name: 'Polygon',
  nativeCurrency: {
    name: 'Polygon',
    symbol: 'MATIC',
    decimals: 18,
  },
  nativeWrappedToken: {
    address: '0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270',
    decimals: 18,
    symbol: 'WMATIC',
    name: 'Wrapped MATIC',
  },
  rpcUrls: [
    process.env.infuraKey ? `https://polygon-mainnet.infura.io/v3/${process.env.infuraKey}` : '',
    'https://polygon-rpc.com/',
    'https://rpc-mainnet.matic.network/',
    'https://rpc-mainnet.maticvigil.com/',
    'https://rpc-mainnet.matic.quiknode.pro/',
  ].filter((url) => url !== ''),
  walletConfig: {
    chainName: 'Polygon Mainnet',
    iconUrls: [getImageUrlFromTrust(polygonMainChainId)],
    rpcUrls: [
      'https://polygon-rpc.com/',
      'https://rpc-mainnet.matic.network/',
      'https://rpc-mainnet.maticvigil.com/',
      'https://rpc-mainnet.matic.quiknode.pro/',
    ],
    blockExplorerUrls: ['https://polygonscan.com/'],
  },
}

export default chainConfig
