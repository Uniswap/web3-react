import { getImageUrlFromTrust } from '../../../utils/helpers'
import { gnosisMainChainId } from '../chainIds'
import { ChainConfig } from '../chains.interface'

const chainConfig: ChainConfig = {
  chainId: gnosisMainChainId,
  name: 'Gnosis',
  nativeCurrency: {
    name: 'xDAI',
    symbol: 'xDAI',
    decimals: 18,
  },
  nativeWrappedToken: {
    address: '0xe91D153E0b41518A2Ce8Dd3D7944Fa863463a97d',
    decimals: 18,
    symbol: 'WXDAI',
    name: 'Wrapped xDAI',
  },
  rpcUrls: [
    'https://rpc.gnosischain.com',
    'https://gnosischain-rpc.gateway.pokt.network',
    'https://xdai-rpc.gateway.pokt.network',
  ],
  walletConfig: {
    chainName: 'Gnosis',
    iconUrls: [getImageUrlFromTrust(gnosisMainChainId)],
    rpcUrls: [
      'https://rpc.gnosischain.com',
      'https://gnosischain-rpc.gateway.pokt.network',
      'https://xdai-rpc.gateway.pokt.network',
    ],
    blockExplorerUrls: ['https://gnosisscan.io/'],
  },
}

export default chainConfig
