import { AddEthereumChainParameter } from '@web3-react/types'
import { ChainConfig } from '../config/chains/chains.interface'
import {
  arbitrumMainChainId,
  arbitrumTestChainId,
  avaxMainChainId,
  avaxTestChainId,
  bscMainChainId,
  bscTestChainId,
  celoMainChainId,
  celoTestChainId,
  ethMainChainId,
  ethGoerliChainId,
  ethSepoliaChainId,
  polygonMainChainId,
  polygonTestChainId,
  optimismMainChainId,
  optimismTestChainId,
  plsTestChainId,
} from '../config/chains/chainIds'
import arbitrumMainnet from '../config/chains/arbitrum/mainnet'
import arbitrumTestnet from '../config/chains/arbitrum/goerli'
import avaxMainnet from '../config/chains/avalanche/mainnet'
import avaxTestnet from '../config/chains/avalanche/fuji'
import bscMainnet from '../config/chains/smart/mainnet'
import bscTestnet from '../config/chains/smart/testnet'
import celoMainnet from '../config/chains/celo/mainnet'
import celoTestnet from '../config/chains/celo/alfajores'
import ethMainnet from '../config/chains/ethereum/mainnet'
import ethGoerliTestnet from '../config/chains/ethereum/goerli'
import ethSepoliaTestnet from '../config/chains/ethereum/sepolia'
import polygonMainnet from '../config/chains/polygon/mainnet'
import polygonTestnet from '../config/chains/polygon/mumbai'
import optimismMainnet from '../config/chains/optimism/mainnet'
import optimismTestnet from '../config/chains/optimism/goerli'
import plsTestnet from '../config/chains/pulse/testnet'

export const CHAINS: { [chainId: number]: ChainConfig } = {
  [arbitrumMainChainId]: {
    ...arbitrumMainnet,
  },
  [arbitrumTestChainId]: {
    ...arbitrumTestnet,
  },
  [avaxMainChainId]: {
    ...avaxMainnet,
  },
  [avaxTestChainId]: {
    ...avaxTestnet,
  },
  [bscMainChainId]: {
    ...bscMainnet,
  },
  [bscTestChainId]: {
    ...bscTestnet,
  },
  [celoMainChainId]: {
    ...celoMainnet,
  },
  [celoTestChainId]: {
    ...celoTestnet,
  },
  [ethMainChainId]: {
    ...ethMainnet,
  },
  [ethGoerliChainId]: {
    ...ethGoerliTestnet,
  },
  [ethSepoliaChainId]: {
    ...ethSepoliaTestnet,
  },
  [polygonMainChainId]: {
    ...polygonMainnet,
  },
  [polygonTestChainId]: {
    ...polygonTestnet,
  },
  [optimismMainChainId]: {
    ...optimismMainnet,
  },
  [optimismTestChainId]: {
    ...optimismTestnet,
  },
  [plsTestChainId]: {
    ...plsTestnet,
  },
}

export const URLS: { [chainId: number]: string[] } = Object.keys(CHAINS).reduce<{
  [chainId: number]: string[]
}>((accumulator, chainId) => {
  const validURLs: string[] = CHAINS[Number(chainId)].rpcUrls

  if (validURLs.length) {
    accumulator[Number(chainId)] = validURLs
  }

  return accumulator
}, {})

export function getAddChainParameters(chainId: number): AddEthereumChainParameter {
  if (!chainId) {
    return undefined
  }

  const {
    chainId: chain,
    nativeCurrency: { name, symbol, decimals },
    walletConfig: { chainName, rpcUrls, blockExplorerUrls, iconUrls },
  } = CHAINS[chainId]

  return {
    chainId: chain,
    chainName,
    nativeCurrency: { name, symbol, decimals },
    rpcUrls,
    blockExplorerUrls,
    iconUrls,
  }
}
