import { ConnectorUpdate } from '@web3-react/types'
import { AbstractConnector } from '@web3-react/abstract-connector'

export class NoEthereumProviderError extends Error {
  public constructor() {
    super()
    this.name = this.constructor.name
    this.message = 'No Ethereum provider was found on window.ethereum.'
  }
}

export class InjectedConnector extends AbstractConnector {
  constructor(kwargs?: any) {
    super(kwargs)

    this.getChainId = this.getChainId.bind(this)

    this.handleConnect = this.handleConnect.bind(this)
    this.handleNetworkChanged = this.handleNetworkChanged.bind(this)
    this.handleChainChanged = this.handleChainChanged.bind(this)
    this.handleAccountsChanged = this.handleAccountsChanged.bind(this)
    this.handleClose = this.handleClose.bind(this)
  }

  private handleConnect(): void {
    if (__DEV__) {
      console.log('Handling connect event')
    }
  }

  private handleNetworkChanged(networkId: string): void {
    if (__DEV__) {
      console.log('Handling networkChanged event with payload', networkId)
    }
    const chainId = parseInt(networkId)
    try {
      this.validateChainId(chainId)
      this.emitUpdate({ chainId })
    } catch (error) {
      this.emitError(error)
    }
  }

  private handleChainChanged(_chainId: string): void {
    if (__DEV__) {
      console.log('Handling chainChanged event with payload', _chainId)
    }
    const chainId = parseInt(_chainId, 16)
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
      console.log('Handling close event with payload', code, reason)
    }
    this.emitDeactivate()
  }

  public async activate(): Promise<ConnectorUpdate> {
    if (!window.ethereum) {
      throw new NoEthereumProviderError()
    }

    window.ethereum.on('connect', this.handleConnect)
    window.ethereum.on('networkChanged', this.handleNetworkChanged)
    window.ethereum.on('chainChanged', this.handleChainChanged)
    window.ethereum.on('accountsChanged', this.handleAccountsChanged)
    window.ethereum.on('close', this.handleClose)

    const accounts = await window.ethereum.send('eth_requestAccounts')
    return { account: accounts[0] }
  }

  public async getProvider(): Promise<any> {
    if (!window.ethereum) {
      throw new NoEthereumProviderError()
    }

    return window.ethereum
  }

  public async getChainId(): Promise<number> {
    if (!window.ethereum) {
      throw new NoEthereumProviderError()
    }

    return await window.ethereum.send('eth_chainId').then(({ result }: any): number => {
      const chainId = parseInt(result, 16)
      this.validateChainId(chainId)
      return chainId
    })
  }

  public async getAccount(): Promise<null | string> {
    if (!window.ethereum) {
      throw new NoEthereumProviderError()
    }

    const accounts: string[] = await window.ethereum.send('eth_accounts').then(({ result }: any): string[] => result)
    return accounts[0]
  }

  public deactivate() {
    if (!window.ethereum) {
      throw new NoEthereumProviderError()
    }

    window.ethereum.removeListener('connect', this.handleConnect)
    window.ethereum.removeListener('networkChanged', this.handleNetworkChanged)
    window.ethereum.removeListener('chainChanged', this.handleChainChanged)
    window.ethereum.removeListener('accountsChanged', this.handleAccountsChanged)
    window.ethereum.removeListener('close', this.handleClose)
  }
}
