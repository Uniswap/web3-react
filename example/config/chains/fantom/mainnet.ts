import { getImageUrlFromTrust } from '../../../utils/helpers'
import { fantomMainChainId } from '../chainIds'
import { ChainConfig } from '../chains.interface'

const chainConfig: ChainConfig = {
  chainId: fantomMainChainId,
  name: 'Fantom Opera',
  nativeCurrency: {
    name: 'Fantom',
    symbol: 'FTM',
    decimals: 18,
  },
  nativeWrappedToken: {
    address: '0x21be370D5312f44cB42ce377BC9b8a0cEF1A4C83',
    decimals: 18,
    symbol: 'WFTM',
    name: 'Wrapped Fantom',
  },
  rpcUrls: [
    'https://rpc.fantom.network',
    'https://rpc2.fantom.network',
    'https://rpc3.fantom.network',
    'https://1rpc.io/ftm',
    'https://rpc.ankr.com/fantom',
    'https://rpcapi.fantom.network',
    'https://fantom-mainnet.gateway.pokt.network/v1/lb/62759259ea1b320039c9e7ac',
  ],
  walletConfig: {
    chainName: 'Fantom Opera',
    iconUrls: [getImageUrlFromTrust(fantomMainChainId)],
    rpcUrls: [
      'https://rpc.fantom.network',
      'https://rpc2.fantom.network',
      'https://rpc3.fantom.network',
      'https://1rpc.io/ftm',
      'https://rpc.ankr.com/fantom',
      'https://rpcapi.fantom.network',
      'https://fantom-mainnet.gateway.pokt.network/v1/lb/62759259ea1b320039c9e7ac',
    ],
    blockExplorerUrls: ['https://ftmscan.com/', 'https://explorer.fantom.network/'],
  },
}

export default chainConfig
