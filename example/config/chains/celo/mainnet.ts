import { getImageUrlFromTrust } from '../../../utils/helpers'
import { celoMainChainId } from '../chainIds'
import { ChainConfig } from '../chains.interface'

const chainConfig: ChainConfig = {
  chainId: celoMainChainId,
  name: 'Celo',
  nativeCurrency: {
    name: 'Ether',
    symbol: 'ETH',
    decimals: 18,
  },
  nativeWrappedToken: {
    address: '0x66803fb87abd4aac3cbb3fad7c3aa01f6f3fb207',
    decimals: 18,
    symbol: 'WETH',
    name: 'Wrapped ETH',
  },
  rpcUrls: [
    process.env.infuraKey ? `https://celo-mainnet.infura.io/v3/${process.env.infuraKey}` : '',
    'https://forno.celo.org',
  ].filter((url) => url !== ''),
  walletConfig: {
    chainName: 'Celo Mainnet',
    iconUrls: [getImageUrlFromTrust(celoMainChainId)],
    rpcUrls: ['https://forno.celo.org'],
    blockExplorerUrls: ['https://explorer.celo.org/'],
  },
}

export default chainConfig
