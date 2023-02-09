import { getImageUrlFromTrust } from '../../../utils/helpers'
import { celoMainChainId, celoTestChainId } from '../chainIds'
import { ChainConfig } from '../chains.interface'

const chainConfig: ChainConfig = {
  chainId: celoTestChainId,
  name: 'Alfajores',
  nativeCurrency: {
    name: 'Celo',
    symbol: 'CELO',
    decimals: 18,
  },
  nativeWrappedToken: {
    address: '0xF194afDf50B03e69Bd7D057c1Aa9e10c9954E4C9',
    decimals: 18,
    symbol: 'CELO',
    name: 'CELO',
  },
  rpcUrls: [
    process.env.infuraKey ? `https://celo-alfajores.infura.io/v3/${process.env.infuraKey}` : '',
    'https://alfajores-forno.celo-testnet.org/',
  ].filter((url) => url !== ''),
  walletConfig: {
    chainName: 'Celo Alfajores Testnet',
    iconUrls: [getImageUrlFromTrust(celoMainChainId)],
    rpcUrls: ['https://alfajores-forno.celo-testnet.org/'],
    blockExplorerUrls: ['https://alfajores-blockscout.celo-testnet.org/'],
  },
}

export default chainConfig
