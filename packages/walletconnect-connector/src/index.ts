import { ConnectorUpdate } from '@web3-react/types'
import { AbstractConnector } from '@web3-react/abstract-connector'
import invariant from 'tiny-invariant'

export const URI_AVAILABLE = 'URI_AVAILABLE'

export class UserRejectedRequestError extends Error {
  public constructor() {
    super()
    this.name = this.constructor.name
    this.message = 'The user rejected the request.'
  }
}

interface WalletConnectConnectorArguments {
  rpc: { [chainId: number]: string }
  bridge?: string
  qrcode?: boolean
  pollingInterval?: number
}

export class WalletConnectConnector extends AbstractConnector {
  private readonly rpc: { [chainId: number]: string | undefined }
  private readonly bridge?: string
  private readonly qrcode?: boolean
  private readonly pollingInterval?: number

  public walletConnectProvider: any

  constructor({ rpc, bridge, qrcode, pollingInterval }: WalletConnectConnectorArguments) {
    invariant(Object.keys(rpc).length === 1, '@walletconnect/web3-provider is broken with >1 chainId, please use 1')
    super({ supportedChainIds: Object.keys(rpc).map(k => Number(k)) })

    this.rpc = rpc
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
    this.emitUpdate({ account: accounts[0] })
  }

  private handleDisconnect(): void {
    if (__DEV__) {
      console.log("Handling 'disconnect' event")
    }
    this.emitDeactivate()
    // we have to do this because of a @walletconnect/web3-provider bug
    if (this.walletConnectProvider) {
      this.walletConnectProvider.stop()
      this.walletConnectProvider.removeListener('chainChanged', this.handleChainChanged)
      this.walletConnectProvider.removeListener('accountsChanged', this.handleAccountsChanged)
      this.walletConnectProvider = undefined
    }

    this.emitDeactivate()
  }

  public async activate(): Promise<ConnectorUpdate> {
    if (!this.walletConnectProvider) {
      const { default: WalletConnectProvider } = await import('@walletconnect/web3-provider')
      this.walletConnectProvider = new WalletConnectProvider({
        bridge: this.bridge,
        rpc: this.rpc,
        qrcode: this.qrcode,
        pollingInterval: this.pollingInterval
      })
      // only doing this here because this.walletConnectProvider.wc doesn't have a removeListener function...
      this.walletConnectProvider.wc.on('disconnect', this.handleDisconnect)
    }

    this.walletConnectProvider.on('chainChanged', this.handleChainChanged)
    this.walletConnectProvider.on('accountsChanged', this.handleAccountsChanged)

    // ensure that the uri is going to be available, and emit an event if there's a new uri
    if (!this.walletConnectProvider.wc.connected) {
      await this.walletConnectProvider.wc.createSession({ chainId: this.walletConnectProvider.chainId })
      this.emit(URI_AVAILABLE, this.walletConnectProvider.wc.uri)
    }

    const account = await this.walletConnectProvider
      .enable()
      .catch((error: Error): void => {
        // TODO ideally this would be a better check
        if (error.message === 'User closed WalletConnect modal') {
          throw new UserRejectedRequestError()
        }

        throw error
      })
      .then((accounts: string[]): string => accounts[0])

    return { provider: this.walletConnectProvider, account }
  }

  public async getProvider(): Promise<any> {
    return this.walletConnectProvider
  }

  public async getChainId(): Promise<number | string> {
    return this.walletConnectProvider.send('eth_chainId')
  }

  public async getAccount(): Promise<null | string> {
    return this.walletConnectProvider.send('eth_accounts').then((accounts: string[]): string => accounts[0])
  }

  public deactivate() {
    if (this.walletConnectProvider) {
      this.walletConnectProvider.stop()
      this.walletConnectProvider.removeListener('chainChanged', this.handleChainChanged)
      this.walletConnectProvider.removeListener('accountsChanged', this.handleAccountsChanged)
    }
  }

  public async close() {
    this.walletConnectProvider.wc.killSession()
  }
}
export default WalletConnectConnector
