import { isAddress, getAddress } from '@ethersproject/address'
import {
  arbitrumChains,
  avaxChains,
  bscChains,
  celoChains,
  polygonChains,
  optimismChains,
  plsChains,
} from '../config/chains/chainIds'

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

  if (celoChains.includes(chainId)) {
    blockChainName = 'celo'
  }

  if (polygonChains.includes(chainId)) {
    blockChainName = 'polygon'
  }

  if (optimismChains.includes(chainId)) {
    blockChainName = 'optimism'
  }

  if (plsChains.includes(chainId)) {
    blockChainName = 'ethereum'
  }

  if (isAddress(tokenAddress)) {
    return `https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/${blockChainName}/assets/${getAddress(
      tokenAddress
    )}/logo.png`
  }

  return `https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/${blockChainName}/info/logo.png`
}
