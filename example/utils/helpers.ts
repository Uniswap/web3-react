import { getAddress, isAddress } from '@ethersproject/address'

import {
  arbitrumChains,
  avaxChains,
  bscChains,
  cardanoChains,
  celoChains,
  etcChains,
  fantomChains,
  // fuseChains,
  // gnosisChains,
  // lightstreamsChains,
  optimismChains,
  plsChains,
  poaChains,
  polygonChains,
  // rskChains,
  solChains,
  thunderChains,
  tronChains,
  ubiqChains,
} from './../config/chains/chainIds'

export function getImageUrlFromTrust(chainId: number, tokenAddress?: string) {
  let blockChainName = 'ethereum'

  if (arbitrumChains.includes(chainId)) {
    blockChainName = 'arbitrum'
  }

  if (avaxChains.includes(chainId)) {
    blockChainName = 'avalanchec'
  }

  if (bscChains.includes(chainId)) {
    blockChainName = 'smartchain'
  }

  if (cardanoChains.includes(chainId)) {
    blockChainName = 'cardano'
  }

  if (celoChains.includes(chainId)) {
    blockChainName = 'celo'
  }

  if (etcChains.includes(chainId)) {
    blockChainName = 'classic'
  }

  if (fantomChains.includes(chainId)) {
    blockChainName = 'fantom'
  }

  // if (fuseChains.includes(chainId)) {
  //   blockChainName = 'fantom'
  // }

  // if (gnosisChains.includes(chainId)) {
  //   blockChainName = 'gnosis'
  // }

  // if (lightstreamsChains.includes(chainId)) {
  //   blockChainName = 'lightstreams'
  // }

  if (optimismChains.includes(chainId)) {
    blockChainName = 'optimism'
  }

  if (poaChains.includes(chainId)) {
    blockChainName = 'poa'
  }

  if (polygonChains.includes(chainId)) {
    blockChainName = 'polygon'
  }

  if (plsChains.includes(chainId)) {
    blockChainName = 'ethereum' // Keep this until mainnet launches
  }

  // if (rskChains.includes(chainId)) {
  //   blockChainName = 'rsk'
  // }

  if (solChains.includes(chainId)) {
    blockChainName = 'solana'
  }

  if (thunderChains.includes(chainId)) {
    blockChainName = 'thundertoken'
  }

  if (tronChains.includes(chainId)) {
    blockChainName = 'tron'
  }

  if (ubiqChains.includes(chainId)) {
    blockChainName = 'ubiq'
  }

  if (isAddress(tokenAddress)) {
    return `https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/${blockChainName}/assets/${getAddress(
      tokenAddress
    )}/logo.png`
  }

  return `https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/${blockChainName}/info/logo.png`
}
