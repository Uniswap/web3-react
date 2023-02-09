import { AddEthereumChainParameter, AddEthereumChainParameters } from '@web3-react/types'

import arbitrumTestnet from '../config/chains/arbitrum/goerli'
import arbitrumMainnet from '../config/chains/arbitrum/mainnet'
import avaxTestnet from '../config/chains/avalanche/fuji'
import avaxMainnet from '../config/chains/avalanche/mainnet'
import cardanoMainnet from '../config/chains/cardano/mainnet'
import cardanoPreProd from '../config/chains/cardano/preProd'
import celoTestnet from '../config/chains/celo/alfajores'
import celoMainnet from '../config/chains/celo/mainnet'
import {
  allEvmChainIds,
  arbitrumMainChainId,
  arbitrumTestChainId,
  avaxMainChainId,
  avaxTestChainId,
  bscMainChainId,
  bscTestChainId,
  cardanoMainChainId,
  cardanoPreProdChainId,
  celoMainChainId,
  celoTestChainId,
  etcKottiChainId,
  etcMainChainId,
  etcMordorChainId,
  ethGoerliChainId,
  ethMainChainId,
  ethSepoliaChainId,
  fantomMainChainId,
  fantomTestChainId,
  fuseMainChainId,
  fuseTestChainId,
  gnosisMainChainId,
  lightstreamsMainChainId,
  lightstreamsTestChainId,
  optimismMainChainId,
  optimismTestChainId,
  plsTestChainId,
  poaMainChainId,
  poaTestChainId,
  polygonMainChainId,
  polygonTestChainId,
  rskMainChainId,
  rskTestChainId,
  solDevChainId,
  solMainChainId,
  solTestChainId,
  thunderMainChainId,
  thunderTestChainId,
  tronMainChainId,
  tronNileChainId,
  tronShastaChainId,
  ubiqMainChainId,
} from '../config/chains/chainIds'
import { ChainConfig } from '../config/chains/chains.interface'
import etcKottiTestnet from '../config/chains/classic/kotti'
import etcMainnet from '../config/chains/classic/mainnet'
import etcMordorTestnet from '../config/chains/classic/mordor'
import ethGoerliTestnet from '../config/chains/ethereum/goerli'
import ethMainnet from '../config/chains/ethereum/mainnet'
import ethSepoliaTestnet from '../config/chains/ethereum/sepolia'
import fantomMainnet from '../config/chains/fantom/mainnet'
import fantomTestnet from '../config/chains/fantom/testnet'
import fuseMainnet from '../config/chains/fuse/mainnet'
import fuseTestnet from '../config/chains/fuse/sparknet'
import gnosisMainnet from '../config/chains/gnosis/mainnet'
import lightstreamsMainnet from '../config/chains/lightstreams/mainnet'
import lightstreamsTestnet from '../config/chains/lightstreams/sirius'
import optimismTestnet from '../config/chains/optimism/goerli'
import optimismMainnet from '../config/chains/optimism/mainnet'
import poaMainnet from '../config/chains/poa/mainnet'
import poaTestnet from '../config/chains/poa/sokol'
import polygonMainnet from '../config/chains/polygon/mainnet'
import polygonTestnet from '../config/chains/polygon/mumbai'
import plsTestnet from '../config/chains/pulse/testnet'
import rskMainnet from '../config/chains/rsk/mainnet'
import rskTestnet from '../config/chains/rsk/testnet'
import bscMainnet from '../config/chains/smart/mainnet'
import bscTestnet from '../config/chains/smart/testnet'
import solDevnet from '../config/chains/sol/devnet'
import solMainnet from '../config/chains/sol/mainnet'
import solTestnet from '../config/chains/sol/testnet'
import thunderMainnet from '../config/chains/thunder/mainnet'
import thunderTestnet from '../config/chains/thunder/testnet'
import tronMainnet from '../config/chains/tron/mainnet'
import tronNileTestnet from '../config/chains/tron/nile'
import tronShastaTestnet from '../config/chains/tron/shasta'
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
  [cardanoMainChainId]: {
    ...cardanoMainnet,
  },
  [cardanoPreProdChainId]: {
    ...cardanoPreProd,
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
  [solMainChainId]: {
    ...solMainnet,
  },
  [solDevChainId]: {
    ...solDevnet,
  },
  [solTestChainId]: {
    ...solTestnet,
  },
  [tronMainChainId]: {
    ...tronMainnet,
  },
  [tronShastaChainId]: {
    ...tronShastaTestnet,
  },
  [tronNileChainId]: {
    ...tronNileTestnet,
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

export const allAddChainParameters: AddEthereumChainParameters = allEvmChainIds.reduce<{
  [chainId: number]: AddEthereumChainParameter
}>((accumulator, chainId) => {
  accumulator[Number(chainId)] = getAddChainParameters(chainId)

  return accumulator
}, {})
