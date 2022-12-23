import { ChainConfig } from '../chains.interface'
import { plsTestChainId } from '../chainIds'
import { getImageUrlFromTrust } from '../helpers'

const chainConfig: ChainConfig = {
  chainId: plsTestChainId,
  name: 'Pulse Testnet',
  nativeCurrency: {
    name: 'Pulse',
    symbol: 'tPLS',
    decimals: 18,
  },
  nativeWrappedToken: {
    address: '0x8a810ea8B121d08342E9e7696f4a9915cBE494B7',
    decimals: 18,
    symbol: 'WPLS',
    name: 'Wrapped PLS',
  },
  rpcUrls: ['https://rpc.v2b.testnet.pulsechain.com'],
  walletConfig: {
    chainName: 'PulseChain Testnet',
    iconUrls: [getImageUrlFromTrust(plsTestChainId)],
    rpcUrls: ['https://rpc.v2b.testnet.pulsechain.com'],
    blockExplorerUrls: ['https://scan.v2b.testnet.pulsechain.com/'],
  },
}

export default chainConfig
