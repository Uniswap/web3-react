import { getImageUrlFromTrust } from '../../../utils/helpers'
import { fuseMainChainId, fuseTestChainId } from '../chainIds'
import { ChainConfig } from '../chains.interface'

const chainConfig: ChainConfig = {
  chainId: fuseTestChainId,
  name: 'Fuse Sparknet',
  nativeCurrency: {
    name: 'Spark',
    symbol: 'SPARK',
    decimals: 18,
  },
  nativeWrappedToken: {
    address: '0xa7C12D4a86EF7DBfd818CDed9B3ae4985f1C3Ab9',
    decimals: 18,
    symbol: 'WFUSE',
    name: 'Wrapped FUSE',
  },
  rpcUrls: ['https://rpc.fusespark.io'],
  walletConfig: {
    chainName: 'Fuse Sparknet',
    iconUrls: [getImageUrlFromTrust(fuseMainChainId)],
    rpcUrls: ['https://rpc.fusespark.io'],
    blockExplorerUrls: ['https://explorer.fusespark.io/'],
  },
}

export default chainConfig
