import { getImageUrlFromTrust } from '../../../utils/helpers'
import { etcMainChainId } from '../chainIds'
import { ChainConfig } from '../chains.interface'

const chainConfig: ChainConfig = {
  chainId: etcMainChainId,
  name: 'Ethereum Classic',
  nativeCurrency: {
    name: 'Ethereum Classic',
    symbol: 'ETC',
    decimals: 18,
  },
  nativeWrappedToken: {
    address: '0x82A618305706B14e7bcf2592D4B9324A366b6dAd',
    decimals: 18,
    symbol: 'WETC',
    name: 'Wrapped ETC',
  },
  rpcUrls: ['https://www.ethercluster.com/etc', 'https://etc.rivet.link', 'https://etc.etcdesktop.com'],
  walletConfig: {
    chainName: 'Ethereum Classic',
    iconUrls: [getImageUrlFromTrust(etcMainChainId)],
    rpcUrls: ['https://www.ethercluster.com/etc', 'https://etc.rivet.link', 'https://etc.etcdesktop.com'],
    blockExplorerUrls: ['https://blockscout.com/etc/mainnet'],
  },
}

export default chainConfig
