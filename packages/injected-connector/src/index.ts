import { AbstractConnectorArguments, ConnectorUpdate } from '@web3-react/types'
import { AbstractConnector } from '@web3-react/abstract-connector'

export class NoEthereumProviderError extends Error {
  public constructor() {
    super()
    this.name = this.constructor.name
    this.message = 'No Ethereum provider was found on window.ethereum.'
  }
}

export class UserRejectedRequestError extends Error {
  public constructor() {
    super()
    this.name = this.constructor.name
    this.message = 'The user rejected the request.'
  }
}

export class InjectedConnector extends AbstractConnector {
  private provider: any

  constructor(kwargs: AbstractConnectorArguments = {}) {
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
    this.emitUpdate({ chainId: networkId })
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
    if (accounts.length === 0) {
      this.emitDeactivate()
    } else {
      this.emitUpdate({ account: accounts[0] })
    }
  }

  private handleClose(code: number, reason: string): void {
    if (__DEV__) {
      console.log("Handling 'close' event with payload", code, reason)
    }
    this.emitDeactivate()
  }

  public async activate(): Promise<ConnectorUpdate> {
    if (!window.ethereum) {
      throw new NoEthereumProviderError()
    }
    this.provider = window.ethereum

    this.provider.on('networkChanged', this.handleNetworkChanged)
    this.provider.on('chainChanged', this.handleChainChanged)
    this.provider.on('accountsChanged', this.handleAccountsChanged)
    this.provider.on('close', this.handleClose)

    const account = await this.provider
      .send('eth_requestAccounts')
      .catch((error: Error): void => {
        if (error && (error as any).code === 4001) {
          throw new UserRejectedRequestError()
        }

        throw error
      })
      .then(({ result: accounts }: any): string[] => accounts[0])

    return { provider: this.provider, account }
  }

  public async getProvider(): Promise<any> {
    return this.provider
  }

  public async getChainId(): Promise<number | string> {
    return this.provider.send('eth_chainId').then(({ result: chainId }: any): number | string => chainId)
  }

  public async getAccount(): Promise<null | string> {
    return this.provider.send('eth_accounts').then(({ result: accounts }: any): string[] => accounts[0])
  }

  public deactivate() {
    this.provider.removeListener('networkChanged', this.handleNetworkChanged)
    this.provider.removeListener('chainChanged', this.handleChainChanged)
    this.provider.removeListener('accountsChanged', this.handleAccountsChanged)
    this.provider.removeListener('close', this.handleClose)
    this.provider = undefined
  }
}
