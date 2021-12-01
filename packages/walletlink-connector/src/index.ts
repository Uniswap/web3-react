import { ConnectorUpdate } from '@web3-react/types'
import { AbstractConnector } from '@web3-react/abstract-connector'

const CHAIN_ID = 1

interface WalletLinkConnectorArguments {
  url: string
  appName: string
  appLogoUrl?: string
  darkMode?: boolean
  supportedChainIds?: number[]
}

export class WalletLinkConnector extends AbstractConnector {
  private readonly url: string
  private readonly appName: string
  private readonly appLogoUrl?: string
  private readonly darkMode: boolean

  public walletLink: any
  private provider: any

  constructor({ url, appName, appLogoUrl, darkMode, supportedChainIds }: WalletLinkConnectorArguments) {
    super({ supportedChainIds: supportedChainIds })

    this.url = url
    this.appName = appName
    this.appLogoUrl = appLogoUrl
    this.darkMode = darkMode || false

    this.handleChainChanged = this.handleChainChanged.bind(this)
    this.handleAccountsChanged = this.handleAccountsChanged.bind(this)
  }

  public async activate(): Promise<ConnectorUpdate> {
    // @ts-ignore
    if (window.ethereum && window.ethereum.isCoinbaseWallet === true) {
      // user is in the dapp browser on Coinbase Wallet
      this.provider = window.ethereum
    } else if (!this.walletLink) {
      const WalletLink = await import('walletlink').then(m => m?.default ?? m)
      this.walletLink = new WalletLink({
        appName: this.appName,
        darkMode: this.darkMode,
        ...(this.appLogoUrl ? { appLogoUrl: this.appLogoUrl } : {})
      })
      this.provider = this.walletLink.makeWeb3Provider(this.url, CHAIN_ID)
    }

    const accounts = await this.provider.request({
      method: 'eth_requestAccounts'
    })
    const account = accounts[0]

    this.provider.on('chainChanged', this.handleChainChanged)
    this.provider.on('accountsChanged', this.handleAccountsChanged)

    return { provider: this.provider, account: account }
  }

  public async getProvider(): Promise<any> {
    return this.provider
  }

  public async getChainId(): Promise<number> {
    return this.provider.chainId
  }

  public async getAccount(): Promise<null | string> {
    const accounts = await this.provider.request({
      method: 'eth_requestAccounts'
    })
    return accounts[0]
  }

  public deactivate() {
    this.provider.removeListener('chainChanged', this.handleChainChanged)
    this.provider.removeListener('accountsChanged', this.handleAccountsChanged)
  }

  public async close() {
    this.provider.close()
    this.emitDeactivate()
  }

  private handleChainChanged(chainId: number | string): void {
    if (__DEV__) {
      console.log("Handling 'chainChanged' event with payload", chainId)
    }
    this.emitUpdate({ chainId: chainId })
  }

  private handleAccountsChanged(accounts: string[]): void {
    if (__DEV__) {
      console.log("Handling 'accountsChanged' event with payload", accounts)
    }
    this.emitUpdate({ account: accounts[0] })
  }
}
