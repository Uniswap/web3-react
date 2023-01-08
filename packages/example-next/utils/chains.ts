import { AddEthereumChainParameter, AddEthereumChainParameters } from '@web3-react/types'
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
  etcMainChainId,
  etcKottiChainId,
  etcMordorChainId,
  fantomMainChainId,
  fantomTestChainId,
  fuseMainChainId,
  fuseTestChainId,
  gnosisMainChainId,
  lightstreamsMainChainId,
  lightstreamsTestChainId,
  optimismMainChainId,
  optimismTestChainId,
  poaMainChainId,
  poaTestChainId,
  polygonMainChainId,
  polygonTestChainId,
  plsTestChainId,
  rskMainChainId,
  rskTestChainId,
  thunderMainChainId,
  thunderTestChainId,
  ubiqMainChainId,
  allChains,
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
import etcMainnet from '../config/chains/classic/mainnet'
import etcKottiTestnet from '../config/chains/classic/kotti'
import etcMordorTestnet from '../config/chains/classic/mordor'
import fantomMainnet from '../config/chains/fantom/mainnet'
import fantomTestnet from '../config/chains/fantom/testnet'
import fuseMainnet from '../config/chains/fuse/mainnet'
import fuseTestnet from '../config/chains/fuse/sparknet'
import gnosisMainnet from '../config/chains/gnosis/mainnet'
import lightstreamsMainnet from '../config/chains/lightstreams/mainnet'
import lightstreamsTestnet from '../config/chains/lightstreams/sirius'
import optimismMainnet from '../config/chains/optimism/mainnet'
import optimismTestnet from '../config/chains/optimism/goerli'
import poaMainnet from '../config/chains/poa/mainnet'
import poaTestnet from '../config/chains/poa/sokol'
import polygonMainnet from '../config/chains/polygon/mainnet'
import polygonTestnet from '../config/chains/polygon/mumbai'
import plsTestnet from '../config/chains/pulse/testnet'
import rskMainnet from '../config/chains/rsk/mainnet'
import rskTestnet from '../config/chains/rsk/testnet'
import thunderMainnet from '../config/chains/thunder/mainnet'
import thunderTestnet from '../config/chains/thunder/testnet'
import ubiqMainnet from '../config/chains/ubiq/mainnet'

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
  [etcMainChainId]: {
    ...etcMainnet,
  },
  [etcKottiChainId]: {
    ...etcKottiTestnet,
  },
  [etcMordorChainId]: {
    ...etcMordorTestnet,
  },
  [fantomMainChainId]: {
    ...fantomMainnet,
  },
  [fantomTestChainId]: {
    ...fantomTestnet,
  },
  [fuseMainChainId]: {
    ...fuseMainnet,
  },
  [fuseTestChainId]: {
    ...fuseTestnet,
  },
  [gnosisMainChainId]: {
    ...gnosisMainnet,
  },
  [lightstreamsMainChainId]: {
    ...lightstreamsMainnet,
  },
  [lightstreamsTestChainId]: {
    ...lightstreamsTestnet,
  },
  [optimismMainChainId]: {
    ...optimismMainnet,
  },
  [optimismTestChainId]: {
    ...optimismTestnet,
  },
  [poaMainChainId]: {
    ...poaMainnet,
  },
  [poaTestChainId]: {
    ...poaTestnet,
  },
  [polygonMainChainId]: {
    ...polygonMainnet,
  },
  [polygonTestChainId]: {
    ...polygonTestnet,
  },
  [plsTestChainId]: {
    ...plsTestnet,
  },
  [rskMainChainId]: {
    ...rskMainnet,
  },
  [rskTestChainId]: {
    ...rskTestnet,
  },
  [thunderMainChainId]: {
    ...thunderMainnet,
  },
  [thunderTestChainId]: {
    ...thunderTestnet,
  },
  [ubiqMainChainId]: {
    ...ubiqMainnet,
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

export const allAddChainParameters: AddEthereumChainParameters = allChains.reduce<{
  [chainId: number]: AddEthereumChainParameter
}>((accumulator, chainId) => {
  accumulator[Number(chainId)] = getAddChainParameters(chainId)

  return accumulator
}, {})
