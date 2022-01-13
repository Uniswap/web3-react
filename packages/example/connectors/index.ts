import type { Web3ReactHooks } from '@web3-react/core'
import type { Frame } from '@web3-react/frame'
import type { Magic } from '@web3-react/magic'
import type { MetaMask } from '@web3-react/metamask'
import type { Network } from '@web3-react/network'
import type { Web3ReactStore } from '@web3-react/types'
import type { WalletConnect } from '@web3-react/walletconnect'
import type { WalletLink } from '@web3-react/walletlink'
import { frame, hooks as frameHooks, store as frameStore } from './frame'
import { hooks as magicHooks, magic, store as magicStore } from './magic'
import { hooks as metaMaskHooks, metaMask, store as metaMaskStore } from './metaMask'
import { hooks as networkHooks, network, store as networkStore } from './network'
import { hooks as walletConnectHooks, store as walletConnectStore, walletConnect } from './walletConnect'
import { hooks as walletLinkHooks, store as walletLinkStore, walletLink } from './walletLink'

export const connectors: [
  MetaMask | WalletConnect | WalletLink | Network | Frame | Magic,
  Web3ReactHooks,
  Web3ReactStore
][] = [
  [metaMask, metaMaskHooks, metaMaskStore],
  [walletConnect, walletConnectHooks, walletConnectStore],
  [walletLink, walletLinkHooks, walletLinkStore],
  [network, networkHooks, networkStore],
  [frame, frameHooks, frameStore],
  [magic, magicHooks, magicStore],
]
