import type { Web3ReactReduxStore } from '@web3-react/types'
import type { Web3ReactHooks } from '@web3-react/core-redux'
import { initializeConnector } from '@web3-react/core-redux'
import { MetaMask } from '@web3-react/metamask'
import { allAddChainParameters } from '../../utils/chains'

export const [metaMask, hooks, store]: [MetaMask, Web3ReactHooks, Web3ReactReduxStore] = initializeConnector<MetaMask>(
  (actions) => new MetaMask({ actions, connectorOptions: { chainParameters: allAddChainParameters } }),
  'metaMask'
)
