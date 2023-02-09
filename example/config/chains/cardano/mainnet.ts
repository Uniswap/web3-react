import { getImageUrlFromTrust } from '../../../utils/helpers'
import { cardanoMainChainId } from '../chainIds'
import { ChainConfig } from '../chains.interface'

const chainConfig: ChainConfig = {
  chainId: cardanoMainChainId,
  name: 'Mainnet',
  nativeCurrency: {
    name: 'ADA',
    symbol: 'ADA',
    decimals: 6,
  },
  nativeWrappedToken: {
    address: '',
    decimals: 6,
    symbol: 'WADA',
    name: 'Wrapped ADA',
  },
  rpcUrls: [''],
  walletConfig: {
    chainName: 'Cardano Mainnet',
    iconUrls: [getImageUrlFromTrust(cardanoMainChainId)],
    rpcUrls: [''],
    blockExplorerUrls: ['https://cardanoscan.io/', 'https://explorer.cardano.org/'],
  },
}

export default chainConfig
