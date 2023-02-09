import { getImageUrlFromTrust } from '../../../utils/helpers'
import { arbitrumMainChainId } from '../chainIds'
import { ChainConfig } from '../chains.interface'

const chainConfig: ChainConfig = {
  chainId: arbitrumMainChainId,
  name: 'Arbitrum One',
  nativeCurrency: {
    name: 'Ether',
    symbol: 'ETH',
    decimals: 18,
  },
  nativeWrappedToken: {
    address: '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1',
    decimals: 18,
    symbol: 'WETH',
    name: 'Wrapped ETH',
  },
  rpcUrls: [
    process.env.infuraKey ? `https://arbitrum-mainnet.infura.io/v3/${process.env.infuraKey}` : '',
    'https://arb1.arbitrum.io/rpc',
  ].filter((url) => url !== ''),
  walletConfig: {
    chainName: 'Arbitrum One',
    iconUrls: [getImageUrlFromTrust(arbitrumMainChainId)],
    rpcUrls: ['https://arb1.arbitrum.io/rpc'],
    blockExplorerUrls: ['https://explorer.arbitrum.io/', 'https://arbiscan.io/'],
  },
}

export default chainConfig
