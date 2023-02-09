import { getImageUrlFromTrust } from '../../../utils/helpers'
import { arbitrumMainChainId, arbitrumTestChainId } from '../chainIds'
import { ChainConfig } from '../chains.interface'

const chainConfig: ChainConfig = {
  chainId: arbitrumTestChainId,
  name: 'Arbitrum Görli',
  nativeCurrency: {
    name: 'Ether',
    symbol: 'AGOR',
    decimals: 18,
  },
  nativeWrappedToken: {
    address: '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1',
    decimals: 18,
    symbol: 'WETH',
    name: 'Wrapped ETH',
  },
  rpcUrls: [
    process.env.infuraKey ? `https://arbitrum-goerli.infura.io/v3/${process.env.infuraKey}` : '',
    'https://goerli-rollup.arbitrum.io/rpc',
  ].filter((url) => url !== ''),
  walletConfig: {
    chainName: 'Arbitrum Görli',
    iconUrls: [getImageUrlFromTrust(arbitrumMainChainId)],
    rpcUrls: ['https://goerli-rollup.arbitrum.io/rpc'],
    blockExplorerUrls: ['https://goerli-rollup-explorer.arbitrum.io/', 'https://goerli.arbiscan.io/'],
  },
}

export default chainConfig
