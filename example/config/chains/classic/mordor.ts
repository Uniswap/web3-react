import { getImageUrlFromTrust } from '../../../utils/helpers'
import { etcMainChainId, etcMordorChainId } from '../chainIds'
import { ChainConfig } from '../chains.interface'

const chainConfig: ChainConfig = {
  chainId: etcMordorChainId,
  name: 'ETC Mordor',
  nativeCurrency: {
    name: 'Mordor ETC',
    symbol: 'METC',
    decimals: 18,
  },
  nativeWrappedToken: {
    address: '0x38F20c2f756530012F139373eed5e227e061a73E',
    decimals: 18,
    symbol: 'WETC',
    name: 'Wrapped ETC',
  },
  rpcUrls: ['https://www.ethercluster.com/mordor'],
  walletConfig: {
    chainName: 'Ethereum Classic Testnet Mordor',
    iconUrls: [getImageUrlFromTrust(etcMainChainId)],
    rpcUrls: ['https://www.ethercluster.com/mordor'],
    blockExplorerUrls: ['https://blockscout.com/etc/mordor'],
  },
}

export default chainConfig
