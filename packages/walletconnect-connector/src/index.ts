import { ConnectorUpdate } from '@web3-react/types'
import { AbstractConnector } from '@web3-react/abstract-connector'

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
  pollingInterval?: number
}

export class WalletConnectConnector extends AbstractConnector {
  private readonly rpc?: { [chainId: number]: string }
  private readonly infuraId?: string
  private readonly bridge?: string
  private readonly qrcode?: boolean
  private readonly pollingInterval?: number

  private provider: any
  public walletConnector: any

  constructor({ rpc, infuraId, bridge, qrcode, pollingInterval }: WalletConnectConnectorArguments) {
    super(rpc ? { supportedChainIds: Object.keys(rpc).map(k => Number(k)) } : {})

    this.rpc = rpc
    this.infuraId = infuraId
    this.bridge = bridge
    this.qrcode = qrcode
    this.pollingInterval = pollingInterval

    this.handleChainChanged = this.handleChainChanged.bind(this)
    this.handleAccountsChanged = this.handleAccountsChanged.bind(this)
    this.handleDisconnect = this.handleDisconnect.bind(this)
  }

  private handleChainChanged(chainId: number | string): void {
    if (__DEV__) {
      console.log("Handling 'chainChanged' event with payload", chainId)
    }
    this.emitUpdate({ chainId })
  }

  private handleAccountsChanged(accounts: string[]): void {
    if (__DEV__) {
      console.log("Handling 'accountsChanged' event with payload", accounts)
    }
    if (accounts.length === 0) {
      this.emitDeactivate()
    } else {
      this.emitUpdate({ account: accounts[0] })
    }
  }

  private handleDisconnect(): void {
    if (__DEV__) {
      console.log("Handling 'disconnect' event")
    }
    this.emitDeactivate()
  }

  public async activate(): Promise<ConnectorUpdate> {
    const { default: WalletConnectProvider } = await import('@walletconnect/web3-provider')
    this.provider = new WalletConnectProvider({
      bridge: this.bridge,
      rpc: this.rpc === undefined ? undefined : this.rpc,
      infuraId: this.infuraId,
      qrcode: this.qrcode,
      pollingInterval: this.pollingInterval
    })
    this.provider.on('chainChanged', this.handleChainChanged)
    this.provider.on('accountsChanged', this.handleAccountsChanged)
    this.walletConnector = this.provider.wc
    this.walletConnector.on('disconnect', this.handleDisconnect)

    // ensure that the uri is going to be available, and emit an event if there's a new uri
    if (!this.walletConnector.connected) {
      await this.walletConnector.createSession({ chainId: this.provider.chainId })
      this.emit(URI_AVAILABLE, this.walletConnector.uri)
    }

    const account = await this.provider
      .enable()
      .catch((error: Error): void => {
        // TODO ideally this would be a better check
        if (error.message === 'User closed WalletConnect modal') {
          throw new UserRejectedRequestError()
        }

        throw error
      })
      .then((accounts: string[]): string => accounts[0])

    return { provider: this.provider, account }
  }

  public async getProvider(): Promise<any> {
    return this.provider
  }

  public async getChainId(): Promise<number | string> {
    return this.provider.send('eth_chainId')
  }

  public async getAccount(): Promise<null | string> {
    return this.provider.send('eth_accounts').then((accounts: string[]): string => accounts[0])
  }

  public deactivate() {
    this.walletConnector.on('disconnect', this.handleDisconnect)
    this.walletConnector = undefined
    this.provider.stop()
    this.provider.removeListener('chainChanged', this.handleChainChanged)
    this.provider.removeListener('accountsChanged', this.handleAccountsChanged)
    this.provider = undefined
  }

  public async close() {
    await this.walletConnector.killSession()
    this.emitDeactivate()
  }
}
