import { initializeConnector } from '@web3-react/core'
import { Network } from '@web3-react/network'

export const URLS = [
  process.env.infuraKey ? `https://mainnet.infura.io/v3/${process.env.infuraKey}` : undefined,
  process.env.alchemyKey ? `https://eth-mainnet.alchemyapi.io/v2/${process.env.alchemyKey}` : undefined,
  'https://cloudflare-eth.com',
].filter((url) => url)

export const [network, useNetwork] = initializeConnector<Network>(Network, [URLS])
