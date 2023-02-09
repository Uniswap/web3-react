import { getImageUrlFromTrust } from '../../../utils/helpers'
import { thunderMainChainId, thunderTestChainId } from '../chainIds'
import { ChainConfig } from '../chains.interface'

const chainConfig: ChainConfig = {
  chainId: thunderTestChainId,
  name: 'ThunderCore Testnet',
  nativeCurrency: {
    name: 'ThunderCore',
    symbol: 'TST',
    decimals: 18,
  },
  nativeWrappedToken: {
    address: '0x390127E81EDe57CFa1e65eA9A96bD68A59D0a099',
    decimals: 18,
    symbol: 'WTT',
    name: 'Wrapped Thunder Token',
  },
  rpcUrls: ['https://testnet-rpc.thundercore.com'],
  walletConfig: {
    chainName: 'ThunderCore Testnet',
    iconUrls: [getImageUrlFromTrust(thunderMainChainId)],
    rpcUrls: ['https://testnet-rpc.thundercore.com'],
    blockExplorerUrls: ['https://explorer-testnet.thundercore.com/'],
  },
}

export default chainConfig
