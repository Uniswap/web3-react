import { getImageUrlFromTrust } from '../../../utils/helpers'
import { tronMainChainId, tronShastaChainId } from '../chainIds'
import { ChainConfig } from '../chains.interface'

const chainConfig: ChainConfig = {
  chainId: tronShastaChainId,
  name: 'Shasta',
  nativeCurrency: {
    name: 'Tron',
    symbol: 'TRX',
    decimals: 6,
  },
  nativeWrappedToken: {
    address: 'TSsj3nsEWiYm81MGzCByjEtGVygh5sRBqd',
    decimals: 6,
    symbol: 'WTRX',
    name: 'Wrapped TRX',
  },
  rpcUrls: ['https://api.shasta.trongrid.io'],
  walletConfig: {
    chainName: 'Shasta',
    iconUrls: [getImageUrlFromTrust(tronMainChainId)],
    rpcUrls: ['https://api.shasta.trongrid.io'],
    blockExplorerUrls: ['https://shasta.tronscan.io/'],
  },
}

export default chainConfig
