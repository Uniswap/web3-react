import type { Web3ReactStore } from '@web3-react/types'
import type { Web3ReactHooks } from '@web3-react/core'
import { initializeConnector } from '@web3-react/core'
import { MetaMask } from '@web3-react/metamask'
import { allAddChainParameters } from '../../utils/chains'

export const [metaMask, hooks]: [MetaMask, Web3ReactHooks, Web3ReactStore] = initializeConnector<MetaMask>(
  (actions) => new MetaMask({ actions, chainParameters: allAddChainParameters })
)
