import { getImageUrlFromTrust } from '../../../utils/helpers'
import { lightstreamsMainChainId, lightstreamsTestChainId } from '../chainIds'
import { ChainConfig } from '../chains.interface'

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
