import { getImageUrlFromTrust } from '../../../utils/helpers'
import { poaMainChainId } from '../chainIds'
import { ChainConfig } from '../chains.interface'

const chainConfig: ChainConfig = {
  chainId: poaMainChainId,
  name: 'POA Core',
  nativeCurrency: {
    name: 'POA',
    symbol: 'POA',
    decimals: 18,
  },
  nativeWrappedToken: {
    address: '0xD2CFBCDbDF02c42951ad269dcfFa27c02151Cebd',
    decimals: 18,
    symbol: 'WPOA',
    name: 'Wrapped POA',
  },
  rpcUrls: ['https://core.poa.network'],
  walletConfig: {
    chainName: 'POA Core',
    iconUrls: [getImageUrlFromTrust(poaMainChainId)],
    rpcUrls: ['https://core.poa.network'],
    blockExplorerUrls: ['https://blockscout.com/poa/core/'],
  },
}

export default chainConfig
