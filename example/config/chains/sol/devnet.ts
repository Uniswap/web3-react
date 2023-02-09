import { getImageUrlFromTrust } from '../../../utils/helpers'
import { solDevChainId, solMainChainId } from '../chainIds'
import { ChainConfig } from '../chains.interface'

const chainConfig: ChainConfig = {
  chainId: solDevChainId,
  name: 'Devnet',
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
  rpcUrls: ['https://api.devnet.solana.com'],
  walletConfig: {
    chainName: 'Solana Devnet',
    iconUrls: [getImageUrlFromTrust(solMainChainId)],
    rpcUrls: ['https://api.devnet.solana.com'],
    blockExplorerUrls: ['https://explorer.solana.com/?cluster=devnet'],
  },
}

export default chainConfig
