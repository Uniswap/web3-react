import { getImageUrlFromTrust } from '../../../utils/helpers'
import { solMainChainId, solTestChainId } from '../chainIds'
import { ChainConfig } from '../chains.interface'

const chainConfig: ChainConfig = {
  chainId: solTestChainId,
  name: 'Testnet',
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
  rpcUrls: ['https://api.testnet.solana.com'],
  walletConfig: {
    chainName: 'Solana Testnet',
    iconUrls: [getImageUrlFromTrust(solMainChainId)],
    rpcUrls: ['https://api.testnet.solana.com'],
    blockExplorerUrls: ['https://explorer.solana.com/?cluster=testnet'],
  },
}

export default chainConfig
