import { getImageUrlFromTrust } from '../../../utils/helpers'
import { solMainChainId } from '../chainIds'
import { ChainConfig } from '../chains.interface'

const chainConfig: ChainConfig = {
  chainId: solMainChainId,
  name: 'Mainnet',
  nativeCurrency: {
    name: 'SOL',
    symbol: 'SOL',
    decimals: 9,
  },
  nativeWrappedToken: {
    address: 'So11111111111111111111111111111111111111112',
    decimals: 9,
    symbol: 'WSOL',
    name: 'Wrapped SOL',
  },
  rpcUrls: ['https://api.mainnet-beta.solana.com'],
  walletConfig: {
    chainName: 'Solana Mainnet',
    iconUrls: [getImageUrlFromTrust(solMainChainId)],
    rpcUrls: ['https://api.mainnet-beta.solana.com'],
    blockExplorerUrls: ['https://explorer.solana.com/'],
  },
}

export default chainConfig
