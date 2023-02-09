import { getImageUrlFromTrust } from '../../../utils/helpers'
import { poaMainChainId, poaTestChainId } from '../chainIds'
import { ChainConfig } from '../chains.interface'

const chainConfig: ChainConfig = {
  chainId: poaTestChainId,
  name: 'POA Sokol',
  nativeCurrency: {
    name: 'Sokol POA',
    symbol: 'SPOA',
    decimals: 18,
  },
  nativeWrappedToken: {
    address: '0xc655c6D80ac92d75fBF4F40e95280aEb855B1E87',
    decimals: 18,
    symbol: 'WSPOA',
    name: 'Wrapped SPOA',
  },
  rpcUrls: ['https://sokol.poa.network'],
  walletConfig: {
    chainName: 'POA Sokol',
    iconUrls: [getImageUrlFromTrust(poaMainChainId)],
    rpcUrls: ['https://sokol.poa.network'],
    blockExplorerUrls: ['https://blockscout.com/poa/sokol/'],
  },
}

export default chainConfig
