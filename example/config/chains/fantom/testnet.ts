import { getImageUrlFromTrust } from '../../../utils/helpers'
import { fantomMainChainId, fantomTestChainId } from '../chainIds'
import { ChainConfig } from '../chains.interface'

const chainConfig: ChainConfig = {
  chainId: fantomTestChainId,
  name: 'Fantom Testnet',
  nativeCurrency: {
    name: 'Fantom',
    symbol: 'FTM',
    decimals: 18,
  },
  nativeWrappedToken: {
    address: '0x249124cE1C6f9C01151c1E28352C37B72B627511',
    decimals: 18,
    symbol: 'WFTM',
    name: 'Wrapped Fantom',
  },
  rpcUrls: ['https://rpc.ankr.com/fantom_testnet', 'https://fantom-testnet.public.blastapi.io'],
  walletConfig: {
    chainName: 'Fantom Testnet',
    iconUrls: [getImageUrlFromTrust(fantomMainChainId)],
    rpcUrls: ['https://rpc.ankr.com/fantom_testnet', 'https://fantom-testnet.public.blastapi.io'],
    blockExplorerUrls: ['https://testnet.ftmscan.com/'],
  },
}

export default chainConfig
