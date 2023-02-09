import { getImageUrlFromTrust } from '../../../utils/helpers'
import { thunderMainChainId } from '../chainIds'
import { ChainConfig } from '../chains.interface'

const chainConfig: ChainConfig = {
  chainId: thunderMainChainId,
  name: 'ThunderCore',
  nativeCurrency: {
    name: 'ThunderCore',
    symbol: 'TT',
    decimals: 18,
  },
  nativeWrappedToken: {
    address: '0x413cefea29f2d07b8f2acfa69d92466b9535f717',
    decimals: 18,
    symbol: 'WTT',
    name: 'Wrapped Thunder Token',
  },
  rpcUrls: [
    'https://mainnet-rpc.thundercore.com',
    'https://mainnet-rpc.thundercore.io',
    'https://mainnet-rpc.thundertoken.net',
  ],
  walletConfig: {
    chainName: 'ThunderCore Mainnet',
    iconUrls: [getImageUrlFromTrust(thunderMainChainId)],
    rpcUrls: [
      'https://mainnet-rpc.thundercore.com',
      'https://mainnet-rpc.thundercore.io',
      'https://mainnet-rpc.thundertoken.net',
    ],
    blockExplorerUrls: ['https://scan.thundercore.com/', 'https://viewblock.io/thundercore'],
  },
}

export default chainConfig
