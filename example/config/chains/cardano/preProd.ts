import { ChainConfig } from '../chains.interface'
import { cardanoMainChainId, cardanoPreProdChainId } from '../chainIds'
import { getImageUrlFromTrust } from '../../../utils/helpers'

const chainConfig: ChainConfig = {
  chainId: cardanoPreProdChainId,
  name: 'PreProd',
  nativeCurrency: {
    name: 'Test ADA',
    symbol: 'TADA',
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
    chainName: 'Cardano PreProd',
    iconUrls: [getImageUrlFromTrust(cardanoMainChainId)],
    rpcUrls: [''],
    blockExplorerUrls: ['https://preprod.cardanoscan.io/', 'https://explorer.cardano-testnet.iohkdev.io/'],
  },
}

export default chainConfig
