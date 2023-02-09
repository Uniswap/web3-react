import { getImageUrlFromTrust } from '../../../utils/helpers'
import { rskMainChainId, rskTestChainId } from '../chainIds'
import { ChainConfig } from '../chains.interface'

const chainConfig: ChainConfig = {
  chainId: rskTestChainId,
  name: 'RSK Testnet',
  nativeCurrency: {
    name: 'RSK Bitcoin',
    symbol: 'tRBTC',
    decimals: 18,
  },
  nativeWrappedToken: {
    address: '0x09b6ca5E4496238A1F176aEa6Bb607DB96c2286E',
    decimals: 18,
    symbol: 'WRBTC',
    name: 'Wrapped RBTC',
  },
  rpcUrls: ['https://public-node.testnet.rsk.co', 'https://mycrypto.testnet.rsk.co'],
  walletConfig: {
    chainName: 'RSK Testnet',
    iconUrls: [getImageUrlFromTrust(rskMainChainId)],
    rpcUrls: ['https://public-node.testnet.rsk.co', 'https://mycrypto.testnet.rsk.co'],
    blockExplorerUrls: ['https://explorer.testnet.rsk.co/'],
  },
}

export default chainConfig
