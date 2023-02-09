import { getImageUrlFromTrust } from '../../../utils/helpers'
import { polygonMainChainId, polygonTestChainId } from '../chainIds'
import { ChainConfig } from '../chains.interface'

const maticTestnet: ChainConfig = {
  chainId: polygonTestChainId,
  name: 'Mumbai',
  nativeCurrency: {
    name: 'Polygon',
    symbol: 'MATIC',
    decimals: 18,
  },
  nativeWrappedToken: {
    address: '0x9c3c9283d3e44854697cd22d3faa240cfb032889',
    decimals: 18,
    symbol: 'WMATIC',
    name: 'Wrapped MATIC',
  },
  rpcUrls: [
    process.env.infuraKey ? `https://polygon-mumbai.infura.io/v3/${process.env.infuraKey}` : '',
    'https://matic-mumbai.chainstacklabs.com',
    'https://rpc-mumbai.matic.today',
  ],
  walletConfig: {
    chainName: 'Polygon Testnet Mumbai',
    iconUrls: [getImageUrlFromTrust(polygonMainChainId)],
    rpcUrls: ['https://matic-mumbai.chainstacklabs.com', 'https://rpc-mumbai.matic.today'],
    blockExplorerUrls: ['https://mumbai.polygonscan.com/'],
  },
}

export default maticTestnet
