import { ConnectorUpdate } from '@web3-react/types'
import { AbstractConnector, UnsupportedChainIdError } from '@web3-react/abstract-connector'
import WalletConnectProvider from '@walletconnect/web3-provider'
export { UnsupportedChainIdError }

export const URI_AVAILABLE = 'URI_AVAILABLE'

export class UserRejectedRequestError extends Error {
  public constructor() {
    super()
    this.name = this.constructor.name
    this.message = 'The user rejected the request.'
  }
}

export interface WalletConnectConnectorArguments {
  rpc?: { [chainId: number]: string }
  infuraId?: string
  bridge?: string
  qrcode?: boolean
}

export class WalletConnectConnector extends AbstractConnector {
  private rpc?: { [chainId: number]: string }
  private infuraId?: string
  private bridge?: string
  private qrcode?: boolean
  private provider: any
  public walletConnector: any

  constructor({ rpc, infuraId, bridge, qrcode }: WalletConnectConnectorArguments) {
    super(rpc ? { supportedChainIds: Object.keys(rpc).map(k => Number(k)) } : {})

    this.rpc = rpc
    this.infuraId = infuraId
    this.bridge = bridge
    this.qrcode = qrcode

    this.handleConnect = this.handleConnect.bind(this)
    this.handleNetworkChanged = this.handleNetworkChanged.bind(this)
    this.handleChainChanged = this.handleChainChanged.bind(this)
    this.handleAccountsChanged = this.handleAccountsChanged.bind(this)
    this.handleClose = this.handleClose.bind(this)
  }

  private handleConnect(): void {
    if (__DEV__) {
      console.log('Logging connect event')
    }
  }

  private handleNetworkChanged(networkId: string): void {
    if (__DEV__) {
      console.log('Handling networkChanged event with payload', networkId)
    }
    // const chainId = parseInt(networkId)
    // try {
    //   this.validateChainId(chainId)
    //   this.emitUpdate({ chainId })
    // } catch (error) {
    //   this.emitError(error)
    // }
  }

  private handleChainChanged(chainId: number): void {
    if (__DEV__) {
      console.log('Logging chainChanged event with payload', chainId)
    }
    try {
      this.validateChainId(chainId)
      this.emitUpdate({ chainId })
    } catch (error) {
      this.emitError(error)
    }
  }

  private handleAccountsChanged(accounts: string[]): void {
    if (__DEV__) {
      console.log('Handling accountsChanged event with payload', accounts)
    }
    if (accounts.length === 0) {
      this.emitDeactivate()
    } else {
      this.emitUpdate({ account: accounts[0] })
    }
  }

  private handleClose(code: number, reason: string): void {
    if (__DEV__) {
      console.log('Logging close event with payload', code, reason)
    }
    // this.emitDeactivate()
  }

  public async activate(): Promise<ConnectorUpdate> {
    this.provider = new WalletConnectProvider({
      bridge: this.bridge,
      rpc: this.rpc === undefined ? undefined : this.rpc,
      infuraId: this.infuraId,
      qrcode: this.qrcode
    })
    const { provider } = this
    this.walletConnector = provider.wc
    const { walletConnector } = this

    provider.on('connect', this.handleConnect)
    provider.on('networkChanged', this.handleNetworkChanged)
    provider.on('chainChanged', this.handleChainChanged)
    provider.on('accountsChanged', this.handleAccountsChanged)
    provider.on('close', this.handleClose)

    // ensure that the uri is going to be available and emit an event
    if (!walletConnector.connected) {
      await walletConnector.createSession({ chainId: provider.chainId })
      this.emit(URI_AVAILABLE, walletConnector.uri)
    }

    const accounts = await provider.enable().catch((error: Error): void => {
      // TODO ideally this would be a better check
      if (error.message === 'User closed WalletConnect modal') {
        throw new UserRejectedRequestError()
      }

      throw error
    })

    return { provider, account: accounts[0] }
  }

  public async getProvider(): Promise<any> {
    return this.provider
  }

  public async getChainId(): Promise<number> {
    const chainId = await this.provider.send('eth_chainId')
    this.validateChainId(chainId)
    return chainId
  }

  public async getAccount(): Promise<null | string> {
    const accounts: string[] = await this.provider.send('eth_accounts')
    return accounts[0]
  }

  public deactivate() {
    const { provider } = this
    provider.stop()
    provider.removeListener('connect', this.handleConnect)
    provider.removeListener('networkChanged', this.handleNetworkChanged)
    provider.removeListener('chainChanged', this.handleChainChanged)
    provider.removeListener('accountsChanged', this.handleAccountsChanged)
    provider.removeListener('close', this.handleClose)
    this.walletConnector = undefined
    this.provider = undefined
  }

  public async close() {
    await this.walletConnector.killSession()
    this.emitDeactivate()
  }
}
