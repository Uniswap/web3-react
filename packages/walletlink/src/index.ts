import { Connector, Actions } from '@web3-react/types'
import type { WalletLink as WalletLinkInstance, WalletLinkOptions } from 'walletlink/dist/WalletLink'

function parseChainId(chainId: string) {
  return Number.parseInt(chainId, 16)
}

export class WalletLink extends Connector {
  private readonly options: WalletLinkOptions & { url: string }
  private eagerConnection?: Promise<void>

  public walletLink: WalletLinkInstance | undefined
  public provider: ReturnType<WalletLinkInstance['makeWeb3Provider']> | undefined

  constructor(actions: Actions, options: WalletLinkOptions & { url: string }, connectEagerly = true) {
    super(actions)
    this.options = options

    if (connectEagerly) {
      this.eagerConnection = this.initialize(true)
    }
  }

  private async initialize(connectEagerly: boolean): Promise<void> {
    const { url, ...options } = this.options

    return import('walletlink')
      .then((m) => new m.WalletLink(options))
      .then((walletLink) => {
        this.walletLink = walletLink
        this.provider = walletLink.makeWeb3Provider(url)

        this.provider.on('connect', ({ chainId }: { chainId: string }): void => {
          this.actions.update({ chainId: parseChainId(chainId) })
        })
        this.provider.on('disconnect', (error: Error): void => {
          this.actions.reportError(error)
        })
        this.provider.on('chainChanged', (chainId: string): void => {
          this.actions.update({ chainId: parseChainId(chainId) })
        })
        this.provider.on('accountsChanged', (accounts: string[]): void => {
          this.actions.update({ accounts })
        })

        if (connectEagerly) {
          return Promise.all([
            this.provider.request({ method: 'eth_chainId' }) as Promise<string>,
            this.provider.request({ method: 'eth_accounts' }) as Promise<string[]>,
          ])
            .then(([chainId, accounts]) => {
              if (accounts.length) {
                this.actions.update({ chainId: parseChainId(chainId), accounts })
              }
            })
            .catch((error) => {
              console.debug('Could not connect eagerly', error)
            })
        }
      })
  }

  public async activate(): Promise<void> {
    this.actions.startActivation()

    if (!this.eagerConnection) {
      this.eagerConnection = this.initialize(false)
    }
    await this.eagerConnection

    return Promise.all([
      this.provider!.request({ method: 'eth_chainId' }) as Promise<string>,
      this.provider!.request({ method: 'eth_requestAccounts' }) as Promise<string[]>,
    ])
      .then(([chainId, accounts]) => {
        this.actions.update({ chainId: parseChainId(chainId), accounts })
      })
      .catch((error) => {
        this.actions.reportError(error)
      })
  }

  public async deactivate(): Promise<void> {
    if (this.walletLink) {
      return this.walletLink.disconnect()
    }
  }
}
