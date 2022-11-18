import { IFrameEthereumProvider } from '@ledgerhq/iframe-provider'
import { AbstractConnector } from '@web3-react/abstract-connector'
import { AbstractConnectorArguments, ConnectorUpdate } from '@web3-react/types'

export class UserRejectedRequestError extends Error {
  public constructor() {
    super()
    this.name = this.constructor.name
    this.message = 'The user rejected the request.'
  }
}

export class LedgerLiveConnector extends AbstractConnector {
  private provider?: IFrameEthereumProvider

  constructor(args: Required<AbstractConnectorArguments>) {
    super(args)

    this.handleNetworkChanged = this.handleNetworkChanged.bind(this)
    this.handleChainChanged = this.handleChainChanged.bind(this)
    this.handleAccountsChanged = this.handleAccountsChanged.bind(this)
    this.handleClose = this.handleClose.bind(this)
  }

  private handleNetworkChanged(networkId: string): void {
    this.emitUpdate({ provider: this.provider, chainId: networkId })
  }

  private handleChainChanged(chainId: string): void {
    this.emitUpdate({ chainId })
  }

  private handleAccountsChanged(accounts: string[]): void {
    this.emitUpdate({ account: accounts.length === 0 ? null : accounts[0] })
  }

  private handleClose(): void {
    this.emitDeactivate()
  }

  public async activate(): Promise<ConnectorUpdate> {
    if (!this.provider) {
      this.provider = new IFrameEthereumProvider()
    }

    this.provider
      .on('networkChanged', this.handleNetworkChanged)
      .on('chainChanged', this.handleChainChanged)
      .on('accountsChanged', this.handleAccountsChanged)
      .on('close', this.handleClose)

    const account = await this.provider
      .enable()
      .then((accounts: string[]): string => accounts[0])
      .catch((error: Error) => {
        if (error && (error as any).code === 4001) {
          throw new UserRejectedRequestError()
        } else {
          throw error
        }
      })

    return { provider: this.provider, account }
  }

  public async getProvider(): Promise<IFrameEthereumProvider | undefined> {
    return this.provider
  }

  public async getChainId(): Promise<number> {
    return this.provider!.send('eth_chainId')
  }

  public async getAccount(): Promise<string> {
    return this.provider!.send('eth_accounts').then((accounts: string[]): string => accounts[0])
  }

  public deactivate() {
    this.provider!.removeListener('networkChanged', this.handleNetworkChanged)
      .removeListener('chainChanged', this.handleChainChanged)
      .removeListener('accountsChanged', this.handleAccountsChanged)
      .removeListener('close', this.handleClose)
  }
}
