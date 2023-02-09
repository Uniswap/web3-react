import { getImageUrlFromTrust } from '../../../utils/helpers'
import { avaxMainChainId } from '../chainIds'
import { ChainConfig } from '../chains.interface'

const chainConfig: ChainConfig = {
  chainId: avaxMainChainId,
  name: 'Avalanche',
  nativeCurrency: {
    name: 'Avalanche',
    symbol: 'AVAX',
    decimals: 18,
  },
  nativeWrappedToken: {
    address: '0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7',
    decimals: 18,
    symbol: 'WAVAX',
    name: 'Wrapped AVAX',
  },
  rpcUrls: [
    process.env.infuraKey ? `https://avalanche-mainnet.infura.io/v3/${process.env.infuraKey}` : '',
    'https://api.avax.network/ext/bc/C/rpc',
  ].filter((url) => url !== ''),
  walletConfig: {
    chainName: 'Avalanche Network',
    iconUrls: [getImageUrlFromTrust(avaxMainChainId)],
    rpcUrls: ['https://api.avax.network/ext/bc/C/rpc'],
    blockExplorerUrls: ['https://snowtrace.io/'],
  },
}

export default chainConfig
