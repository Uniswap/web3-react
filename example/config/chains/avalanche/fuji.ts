import { getImageUrlFromTrust } from '../../../utils/helpers'
import { avaxMainChainId, avaxTestChainId } from '../chainIds'
import { ChainConfig } from '../chains.interface'

const chainConfig: ChainConfig = {
  chainId: avaxTestChainId,
  name: 'Fuji',
  nativeCurrency: {
    name: 'Avalanche',
    symbol: 'AVAX',
    decimals: 18,
  },
  nativeWrappedToken: {
    address: '0xd00ae08403B9bbb9124bB305C09058E32C39A48c',
    decimals: 18,
    symbol: 'WAVAX',
    name: 'Wrapped AVAX',
  },
  rpcUrls: [
    process.env.infuraKey ? `https://avalanche-fuji.infura.io/v3/${process.env.infuraKey}` : '',
    'https://rpc.ankr.com/avalanche_fuji',
    'https://api.avax-test.network/ext/bc/C/rpc',
  ].filter((url) => url !== ''),
  walletConfig: {
    chainName: 'Avalanche Fuji Testnet',
    iconUrls: [getImageUrlFromTrust(avaxMainChainId)],
    rpcUrls: ['https://rpc.ankr.com/avalanche_fuji', 'https://api.avax-test.network/ext/bc/C/rpc'],
    blockExplorerUrls: ['https://testnet.snowtrace.io/'],
  },
}

export default chainConfig
