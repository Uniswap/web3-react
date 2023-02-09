import { getImageUrlFromTrust } from '../../../utils/helpers'
import { ubiqMainChainId } from '../chainIds'
import { ChainConfig } from '../chains.interface'

const chainConfig: ChainConfig = {
  chainId: ubiqMainChainId,
  name: 'Ubiq',
  nativeCurrency: {
    name: 'Ubiq',
    symbol: 'UBQ',
    decimals: 18,
  },
  nativeWrappedToken: {
    address: '0xa8cF68b59a616c260dd88Fd1ea61fBB864f7E485',
    decimals: 18,
    symbol: 'WETH',
    name: 'Wrapped ETH',
  },
  rpcUrls: ['https://rpc.octano.dev', 'https://pyrus2.ubiqscan.io'],
  walletConfig: {
    chainName: 'Ubiq',
    iconUrls: [getImageUrlFromTrust(ubiqMainChainId)],
    rpcUrls: ['https://rpc.octano.dev', 'https://pyrus2.ubiqscan.io'],
    blockExplorerUrls: ['https://ubiqscan.io/', 'https://ubqblockexplorer.com/'],
  },
}

export default chainConfig
