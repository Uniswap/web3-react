import { InjectedConnector } from '@web3-react/injected-connector'
import { WalletConnectConnector } from '@web3-react/walletconnect-connector'
import { WalletLinkConnector } from '@web3-react/walletlink-connector'
import { NetworkConnector } from '@web3-react/network-connector'
import { FortmaticConnector } from '@web3-react/fortmatic-connector'
import { PortisConnector } from '@web3-react/portis-connector'

const POLLING_INTERVAL = 8000
const RPC_URL: string = process.env.RPC_URL as string

export const injected = new InjectedConnector({ supportedChainIds: [1, 3, 4, 5, 42] })

export const walletconnect = new WalletConnectConnector({
  rpc: { 1: RPC_URL },
  pollingInterval: POLLING_INTERVAL,
  bridge: 'https://bridge.walletconnect.org',
  qrcode: true
})

export const walletlink = new WalletLinkConnector({
  url: RPC_URL,
  chainId: 1,
  appName: 'web3-react example',
  appLogoUrl: 'https://github.com/NoahZinsmeister/web3-react'
})

export const network = new NetworkConnector({ url: RPC_URL, chainId: 1, pollingInterval: POLLING_INTERVAL })

export const fortmatic = new FortmaticConnector({ apiKey: process.env.FORTMATIC_API_KEY as string, chainId: 4 })

export const portis = new PortisConnector({ dAppId: process.env.PORTIS_DAPP_ID as string, networks: [1, 100] })
