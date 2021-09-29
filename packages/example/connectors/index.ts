import { UseStore } from 'zustand'
import { Connector, Web3ReactState } from '@web3-react/types'
import { network, useNetwork } from './network'
import { metaMask, useMetaMask } from './metaMask'
import { walletConnect, useWalletConnect } from './walletConnect'

export const connectors: [Connector, UseStore<Web3ReactState>][] = [
  [network, useNetwork],
  [metaMask, useMetaMask],
  [walletConnect, useWalletConnect],
]
