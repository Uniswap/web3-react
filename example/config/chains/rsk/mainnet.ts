import { getImageUrlFromTrust } from '../../../utils/helpers'
import { rskMainChainId } from '../chainIds'
import { ChainConfig } from '../chains.interface'

const chainConfig: ChainConfig = {
  chainId: rskMainChainId,
  name: 'RSK',
  nativeCurrency: {
    name: 'RSK Bitcoin',
    symbol: 'RBTC',
    decimals: 18,
  },
  nativeWrappedToken: {
    address: '0x967f8799aF07DF1534d48A95a5C9FEBE92c53ae0',
    decimals: 18,
    symbol: 'WRBTC',
    name: 'Wrapped RBTC',
  },
  rpcUrls: ['https://public-node.rsk.co', 'https://mycrypto.rsk.co'],
  walletConfig: {
    chainName: 'RSK Mainnet',
    iconUrls: [getImageUrlFromTrust(rskMainChainId)],
    rpcUrls: ['https://public-node.rsk.co', 'https://mycrypto.rsk.co'],
    blockExplorerUrls: ['https://explorer.rsk.co/'],
  },
}

export default chainConfig
