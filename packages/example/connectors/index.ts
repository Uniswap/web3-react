import { UseStore } from 'zustand/esm'
import { Connector, Web3ReactState } from '@web3-react/types'
import { network, useNetwork } from './network'
import { metaMask, useMetaMask } from './metaMask'
import { walletConnect, useWalletConnect } from './walletConnect'
import { walletLink, useWalletLink } from './walletLink'
import { frame, useFrame } from './frame'

export const connectors: [Connector, UseStore<Web3ReactState>][] = [
  [network, useNetwork],
  [metaMask, useMetaMask],
  [walletConnect, useWalletConnect],
  [walletLink, useWalletLink],
  [frame, useFrame],
]
