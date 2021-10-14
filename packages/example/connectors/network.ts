import { initializeConnector } from '@web3-react/core'
import { Network } from '@web3-react/network'

export const URLS = {
  1: [
    process.env.infuraKey ? `https://mainnet.infura.io/v3/${process.env.infuraKey}` : undefined,
    process.env.alchemyKey ? `https://eth-mainnet.alchemyapi.io/v2/${process.env.alchemyKey}` : undefined,
    'https://cloudflare-eth.com',
  ],
  3: [process.env.infuraKey ? `https://ropsten.infura.io/v3/${process.env.infuraKey}` : undefined],
  4: [process.env.infuraKey ? `https://rinkeby.infura.io/v3/${process.env.infuraKey}` : undefined],
  5: [process.env.infuraKey ? `https://goerli.infura.io/v3/${process.env.infuraKey}` : undefined],
  42: [process.env.infuraKey ? `https://kovan.infura.io/v3/${process.env.infuraKey}` : undefined],
  10: [process.env.infuraKey ? `https://optimism-mainnet.infura.io/v3/${process.env.infuraKey}` : undefined],
  137: [process.env.infuraKey ? `https://polygon-mainnet.infura.io/v3/${process.env.infuraKey}` : undefined],
  42161: [process.env.infuraKey ? `https://arbitrum-mainnet.infura.io/v3/${process.env.infuraKey}` : undefined],
}

// filter out invalid urls
for (const chainId of Object.keys(URLS)) {
  const filtered: string[] = URLS[chainId].filter((url) => url)
  if (filtered.length === 0) {
    delete URLS[chainId]
  } else {
    URLS[chainId] = filtered
  }
}

export const [network, hooks] = initializeConnector<Network>(
  (actions) => new Network(actions, URLS),
  Object.keys(URLS).map((chainId) => Number(chainId))
)
