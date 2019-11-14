import { InjectedConnector } from '@web3-react/injected-connector'
import { WalletConnectConnector } from '@web3-react/walletconnect-connector'
import { FortmaticConnector } from '@web3-react/fortmatic-connector'
import { PortisConnector } from '@web3-react/portis-connector'

export const injected = new InjectedConnector({ supportedChainIds: [1, 4, 5] })

export const walletconnect = new WalletConnectConnector({
  rpc: { 1: process.env.RPC_URL as string },
  bridge: 'https://bridge.walletconnect.org',
  qrcode: true
})

export const fortmatic = new FortmaticConnector({ apiKey: process.env.FORTMATIC_API_KEY as string })

export const portis = new PortisConnector({ dAppId: process.env.PORTIS_DAPP_ID as string })
