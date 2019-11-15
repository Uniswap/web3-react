import { ConnectorUpdate } from '@web3-react/types'
import { AbstractConnector } from '@web3-react/abstract-connector'

export interface WalletLinkConnectorArguments {
  url: string
  chainId: number
  appName: string
  appLogoUrl?: string
}

export class WalletLinkConnector extends AbstractConnector {
  private readonly url: string
  private readonly chainId: number
  private readonly appName: string
  private readonly appLogoUrl?: string

  public walletLink: any
  private provider: any

  constructor({ url, chainId, appName, appLogoUrl }: WalletLinkConnectorArguments) {
    super({ supportedChainIds: [chainId] })

    this.url = url
    this.chainId = chainId
    this.appName = appName
    this.appLogoUrl = appLogoUrl

    this.handleAccountsChanged = this.handleAccountsChanged.bind(this)
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

  public async activate(): Promise<ConnectorUpdate> {
    const { default: WalletLink } = await import('walletlink')
    this.walletLink = new WalletLink({
      appName: this.appName,
      ...(this.appLogoUrl ? { appLogoUrl: this.appLogoUrl } : {})
    })
    this.provider = this.walletLink.makeWeb3Provider(this.url, this.chainId)

    this.provider.on('accountsChanged', this.handleAccountsChanged)

    const account = await this.provider.send('eth_requestAccounts').then((accounts: string[]): string => accounts[0])

    return { provider: this.provider, account: account }
  }

  public async getProvider(): Promise<any> {
    return this.provider
  }

  public async getChainId(): Promise<number | string> {
    return this.chainId
  }

  public async getAccount(): Promise<null | string> {
    return this.provider.send('eth_accounts').then((accounts: string[]): string => accounts[0])
  }

  public deactivate() {
    this.provider.removeListener('accountsChanged', this.handleAccountsChanged)
    this.provider = undefined
    this.walletLink = undefined
  }
}
