import { ChainConfig } from '../chains.interface'
import { lightstreamsMainChainId } from '../chainIds'
import { getImageUrlFromTrust } from '../../../utils/helpers'

const chainConfig: ChainConfig = {
  chainId: lightstreamsMainChainId,
  name: 'Lightstreams',
  nativeCurrency: {
    name: 'Lightstreams',
    symbol: 'PHT',
    decimals: 18,
  },
  nativeWrappedToken: undefined,
  rpcUrls: ['https://node.mainnet.lightstreams.io'],
  walletConfig: {
    chainName: 'Lightstreams Mainnet',
    iconUrls: [getImageUrlFromTrust(lightstreamsMainChainId)],
    rpcUrls: ['https://node.mainnet.lightstreams.io'],
    blockExplorerUrls: ['https://explorer.mainnet.lightstreams.io/'],
  },
}

export default chainConfig
