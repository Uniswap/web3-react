import { getImageUrlFromTrust } from '../../../utils/helpers'
import { bscMainChainId, bscTestChainId } from '../chainIds'
import { ChainConfig } from '../chains.interface'

const chainConfig: ChainConfig = {
  chainId: bscTestChainId,
  name: 'BSC Testnet',
  nativeCurrency: {
    name: 'Binance Coin',
    symbol: 'tBNB',
    decimals: 18,
  },
  nativeWrappedToken: {
    address: '0xae13d989dac2f0debff460ac112a837c89baa7cd',
    decimals: 18,
    symbol: 'WBNB',
    name: 'Wrapped BNB',
  },
  rpcUrls: [
    'https://data-seed-prebsc-1-s1.binance.org:8545/',
    'https://data-seed-prebsc-1-s3.binance.org:8545/',
    'https://data-seed-prebsc-2-s1.binance.org:8545/',
    'https://bsc-dataseed1.defibit.io/',
    'https://bsc-dataseed1.ninicoin.io/',
  ],
  walletConfig: {
    chainName: 'Binance Smart Chain Testnet',
    iconUrls: [getImageUrlFromTrust(bscMainChainId)],
    rpcUrls: [
      'https://data-seed-prebsc-1-s1.binance.org:8545/',
      'https://data-seed-prebsc-1-s3.binance.org:8545/',
      'https://data-seed-prebsc-2-s1.binance.org:8545/',
      'https://bsc-dataseed1.defibit.io/',
      'https://bsc-dataseed1.ninicoin.io/',
    ],
    blockExplorerUrls: ['https://testnet.bscscan.com/'],
  },
}

export default chainConfig
