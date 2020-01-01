import { AbstractConnectorArguments, ConnectorUpdate } from '@web3-react/types'
import { AbstractConnector } from '@web3-react/abstract-connector'
import ethProvider from 'eth-provider'
import invariant from 'tiny-invariant'

export class UserRejectedRequestError extends Error {
  public constructor() {
    super()
    this.name = this.constructor.name
    this.message = 'The user rejected the request.'
  }
}

export class FrameConnector extends AbstractConnector {
  private provider: any

  constructor(kwargs: Required<AbstractConnectorArguments>) {
    invariant(kwargs.supportedChainIds.length === 1, 'This connector only supports 1 chainId at the moment.')
    super(kwargs)

    this.handleNetworkChanged = this.handleNetworkChanged.bind(this)
    this.handleChainChanged = this.handleChainChanged.bind(this)
    this.handleAccountsChanged = this.handleAccountsChanged.bind(this)
    this.handleClose = this.handleClose.bind(this)
  }

  private handleNetworkChanged(networkId: string): void {
    if (__DEV__) {
      console.log("Handling 'networkChanged' event with payload", networkId)
    }
    this.emitUpdate({ provider: this.provider, chainId: networkId })
  }

  private handleChainChanged(chainId: string): void {
    if (__DEV__) {
      console.log("Handling 'chainChanged' event with payload", chainId)
    }
    this.emitUpdate({ chainId })
  }

  private handleAccountsChanged(accounts: string[]): void {
    if (__DEV__) {
      console.log("Handling 'accountsChanged' event with payload", accounts)
    }
    this.emitUpdate({ account: accounts.length === 0 ? null : accounts[0] })
  }

  private handleClose(code: number, reason: string): void {
    if (__DEV__) {
      console.log("Handling 'close' event with payload", code, reason)
    }
    this.emitDeactivate()
  }

  public async activate(): Promise<ConnectorUpdate> {
    if (!this.provider) {
      this.provider = ethProvider('frame')
    }

    this.provider
      .on('networkChanged', this.handleNetworkChanged)
      .on('chainChanged', this.handleChainChanged)
      .on('accountsChanged', this.handleAccountsChanged)
      .on('close', this.handleClose)

    const account = await this.provider
      .enable()
      .then((accounts: string[]): string => accounts[0])
      .catch((error: Error): void => {
        if (error && (error as any).code === 4001) {
          throw new UserRejectedRequestError()
        } else {
          throw error
        }
      })

    return { provider: this.provider, account }
  }

  public async getProvider(): Promise<any> {
    return this.provider
  }

  public async getChainId(): Promise<number> {
    return this.provider.send('eth_chainId')
  }

  public async getAccount(): Promise<null> {
    return this.provider.send('eth_accounts').then((accounts: string[]): string => accounts[0])
  }

  public deactivate() {
    this.provider
      .removeListener('networkChanged', this.handleNetworkChanged)
      .removeListener('chainChanged', this.handleChainChanged)
      .removeListener('accountsChanged', this.handleAccountsChanged)
      .removeListener('close', this.handleClose)
  }
}
