import type { Web3ReactHooks } from '@web3-react/core'
import { Connector } from '@web3-react/types'
import { network, hooks as networkHooks } from './network'
import { metaMask, hooks as metaMaskHooks } from './metaMask'
import { walletConnect, hooks as walletConnectHooks } from './walletConnect'
import { walletLink, hooks as walletLinkHooks } from './walletLink'
import { frame, hooks as frameHooks } from './frame'
import { magic, hooks as magicHooks } from './magic'

export const connectors: [Connector, Web3ReactHooks][] = [
  [network, networkHooks],
  [metaMask, metaMaskHooks],
  [walletConnect, walletConnectHooks],
  [walletLink, walletLinkHooks],
  [frame, frameHooks],
  [magic, magicHooks],
]
