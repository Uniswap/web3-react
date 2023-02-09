import { ChainConfig } from '../chains.interface'
import { lightstreamsTestChainId, lightstreamsMainChainId } from '../chainIds'
import { getImageUrlFromTrust } from '../../../utils/helpers'

const chainConfig: ChainConfig = {
  chainId: lightstreamsTestChainId,
  name: 'Sirius',
  nativeCurrency: {
    name: 'Lightstreams',
    symbol: 'PHT',
    decimals: 18,
  },
  nativeWrappedToken: undefined,
  rpcUrls: ['https://node.sirius.lightstreams.io'],
  walletConfig: {
    chainName: 'Sirius',
    iconUrls: [getImageUrlFromTrust(lightstreamsMainChainId)],
    rpcUrls: ['https://node.sirius.lightstreams.io'],
    blockExplorerUrls: ['https://explorer.sirius.lightstreams.io/home'],
  },
}

export default chainConfig
