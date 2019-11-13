import { InjectedConnector } from '@web3-react/injected-connector'
import { WalletConnectConnector } from '@web3-react/walletconnect-connector'

export const injected = new InjectedConnector({ supportedChainIds: [1, 4, 5] })
export const walletconnect = new WalletConnectConnector({
  rpc: { 1: process.env.RPC_URL as string },
  bridge: 'https://bridge.walletconnect.org',
  qrcode: true
})
