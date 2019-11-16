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

    window.ethereum.on('networkChanged', this.handleNetworkChanged)
    window.ethereum.on('chainChanged', this.handleChainChanged)
    window.ethereum.on('accountsChanged', this.handleAccountsChanged)
    window.ethereum.on('close', this.handleClose)

    const account = await window.ethereum
      .send('eth_requestAccounts')
      .catch((error: Error): void => {
        if (error && error.code === 4001) {
          throw new UserRejectedRequestError()
        } else {
          throw error
        }
      })
      .then(({ result: accounts }: any): string => accounts[0])

    return { provider: window.ethereum, account }
  }

  public async getProvider(): Promise<any> {
    return window.ethereum
  }

  public async getChainId(): Promise<number | string> {
    if (!window.ethereum) {
      throw new NoEthereumProviderError()
    }
    return window.ethereum.send('eth_chainId').then(({ result: chainId }: any): number | string => chainId)
  }

  public async getAccount(): Promise<null | string> {
    if (!window.ethereum) {
      throw new NoEthereumProviderError()
    }
    return window.ethereum.send('eth_accounts').then(({ result: accounts }: any): string => accounts[0])
  }

  public deactivate() {
    if (window.ethereum) {
      window.ethereum.removeListener('networkChanged', this.handleNetworkChanged)
      window.ethereum.removeListener('chainChanged', this.handleChainChanged)
      window.ethereum.removeListener('accountsChanged', this.handleAccountsChanged)
      window.ethereum.removeListener('close', this.handleClose)
    }
  }

  public async isAuthorized(): Promise<boolean> {
    if (window.ethereum) {
      return window.ethereum
        .send('eth_accounts')
        .then(({ result: accounts }: any) => {
          if (accounts.length > 0) {
            return true
          } else {
            return false
          }
        })
        .catch(() => {
          return false
        })
    } else {
      return false
    }
  }
}
