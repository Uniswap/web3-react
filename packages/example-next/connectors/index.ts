import { Web3ReactHooks } from '@web3-react/core'
import { Connector } from '@web3-react/types'
import { eip1193, hooks as eip1193Hooks } from './eip1193'
import { metaMask, hooks as metamaskHooks } from './metaMask'
import { network, hooks as networkHooks } from './network'
import { walletConnect, hooks as walletConnectHooks } from './walletConnect'

// implicit type problem with Web3Manager, not sure what's causing it but need to declare type explicitly as a workaround
const connectors: [Connector, Web3ReactHooks][] = [
  [metaMask, metamaskHooks],
  [eip1193, eip1193Hooks],
  [network, networkHooks],
  [walletConnect, walletConnectHooks],
]

export default connectors
