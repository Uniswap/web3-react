import { getImageUrlFromTrust } from '../../../utils/helpers'
import { etcKottiChainId, etcMainChainId } from '../chainIds'
import { ChainConfig } from '../chains.interface'

const chainConfig: ChainConfig = {
  chainId: etcKottiChainId,
  name: 'ETC Kotti',
  nativeCurrency: {
    name: 'Mordor ETC',
    symbol: 'METC',
    decimals: 18,
  },
  nativeWrappedToken: {
    address: '0xE6CaF54ae3bA08E7aa07ae199Af09bA6fd239F98',
    decimals: 18,
    symbol: 'WETC',
    name: 'Wrapped ETC',
  },
  rpcUrls: ['https://www.ethercluster.com/kotti'],
  walletConfig: {
    chainName: 'Ethereum Classic Testnet Kotti',
    iconUrls: [getImageUrlFromTrust(etcMainChainId)],
    rpcUrls: ['https://www.ethercluster.com/kotti'],
    blockExplorerUrls: ['https://blockscout.com/etc/kotti'],
  },
}

export default chainConfig
