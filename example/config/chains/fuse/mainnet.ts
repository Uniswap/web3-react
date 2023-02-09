import { getImageUrlFromTrust } from '../../../utils/helpers'
import { fuseMainChainId } from '../chainIds'
import { ChainConfig } from '../chains.interface'

const chainConfig: ChainConfig = {
  chainId: fuseMainChainId,
  name: 'Fuse',
  nativeCurrency: {
    name: 'Fuse',
    symbol: 'FUSE',
    decimals: 18,
  },
  nativeWrappedToken: {
    address: '0x0BE9e53fd7EDaC9F859882AfdDa116645287C629',
    decimals: 18,
    symbol: 'WFUSE',
    name: 'Wrapped FUSE',
  },
  rpcUrls: ['https://rpc.fuse.io'],
  walletConfig: {
    chainName: 'Fuse',
    iconUrls: [getImageUrlFromTrust(fuseMainChainId)],
    rpcUrls: ['https://rpc.fuse.io'],
    blockExplorerUrls: ['https://explorer.fuse.io/'],
  },
}

export default chainConfig
