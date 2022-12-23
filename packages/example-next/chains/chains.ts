import { AddEthereumChainParameter } from '@web3-react/types'
import { ChainConfig } from './chains.interface'
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
} from './chainIds'
import arbitrumMainnet from './arbitrum/mainnet'
import arbitrumTestnet from './arbitrum/goerli'
import avaxMainnet from './avalanche/mainnet'
import avaxTestnet from './avalanche/fuji'
import bscMainnet from './smart/mainnet'
import bscTestnet from './smart/testnet'
import celoMainnet from './celo/mainnet'
import celoTestnet from './celo/alfajores'
import ethMainnet from './ethereum/mainnet'
import ethGoerliTestnet from './ethereum/goerli'
import ethSepoliaTestnet from './ethereum/sepolia'
import polygonMainnet from './polygon/mainnet'
import polygonTestnet from './polygon/mumbai'
import optimismMainnet from './optimism/mainnet'
import optimismTestnet from './optimism/goerli'
import plsTestnet from './pulse/testnet'

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
