import { getImageUrlFromTrust } from '../../../utils/helpers'
import { tronMainChainId, tronNileChainId } from '../chainIds'
import { ChainConfig } from '../chains.interface'

const chainConfig: ChainConfig = {
  chainId: tronNileChainId,
  name: 'Nile',
  nativeCurrency: {
    name: 'Tron',
    symbol: 'TRX',
    decimals: 6,
  },
  nativeWrappedToken: {
    address: 'TYsbWxNnyTgsZaTFaue9hqpxkU3Fkco94a',
    decimals: 6,
    symbol: 'WTRX',
    name: 'Wrapped TRX',
  },
  rpcUrls: [' https://api.nileex.io/'],
  walletConfig: {
    chainName: 'Nile',
    iconUrls: [getImageUrlFromTrust(tronMainChainId)],
    rpcUrls: [' https://api.nileex.io/'],
    blockExplorerUrls: ['https://nile.tronscan.org/'],
  },
}

export default chainConfig
