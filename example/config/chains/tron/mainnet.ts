import { getImageUrlFromTrust } from '../../../utils/helpers'
import { tronMainChainId } from '../chainIds'
import { ChainConfig } from '../chains.interface'

const chainConfig: ChainConfig = {
  chainId: tronMainChainId,
  name: 'Tron',
  nativeCurrency: {
    name: 'Tron',
    symbol: 'TRX',
    decimals: 6,
  },
  nativeWrappedToken: {
    address: 'TNUC9Qb1rRpS5CbWLmNMxXBjyFoydXjWFR',
    decimals: 6,
    symbol: 'WTRX',
    name: 'Wrapped TRX',
  },
  rpcUrls: ['https://api.trongrid.io'],
  walletConfig: {
    chainName: 'Tron',
    iconUrls: [getImageUrlFromTrust(tronMainChainId)],
    rpcUrls: ['https://api.trongrid.io'],
    blockExplorerUrls: ['https://tronscan.org/'],
  },
}

export default chainConfig
