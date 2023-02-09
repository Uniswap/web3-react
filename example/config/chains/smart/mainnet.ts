import { getImageUrlFromTrust } from '../../../utils/helpers'
import { bscMainChainId } from '../chainIds'
import { ChainConfig } from '../chains.interface'

const chainConfig: ChainConfig = {
  chainId: bscMainChainId,
  name: 'BSC',
  nativeCurrency: {
    name: 'Binance Coin',
    symbol: 'BNB',
    decimals: 18,
  },
  nativeWrappedToken: {
    address: '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c',
    decimals: 18,
    symbol: 'WBNB',
    name: 'Wrapped BNB',
  },
  rpcUrls: [
    'https://bsc-dataseed1.binance.org:443',
    'https://bsc-dataseed.binance.org/',
    'https://bsc-dataseed1.defibit.io/',
    'https://bsc-dataseed1.ninicoin.io/',
  ],
  walletConfig: {
    chainName: 'Binance Smart Chain Mainnet',
    iconUrls: [getImageUrlFromTrust(bscMainChainId)],
    rpcUrls: [
      'https://bsc-dataseed1.binance.org:443',
      'https://bsc-dataseed.binance.org/',
      'https://bsc-dataseed1.defibit.io/',
      'https://bsc-dataseed1.ninicoin.io/',
    ],
    blockExplorerUrls: ['https://bscscan.com/'],
  },
}

export default chainConfig
