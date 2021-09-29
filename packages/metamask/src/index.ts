import { Connector, Actions, Provider } from '@web3-react/types'
import type detectEthereumProvider from '@metamask/detect-provider'

export class NoMetaMaskError extends Error {
  public constructor() {
    super('MetaMask not installed')
    Object.setPrototypeOf(this, NoMetaMaskError.prototype)
  }
}

function parseChainId(chainId: string) {
  return Number.parseInt(chainId, 16)
}

export class MetaMask extends Connector {
  private readonly options?: NonNullable<Parameters<typeof detectEthereumProvider>[0]>
  private providerPromise?: Promise<void>

  constructor(
    actions: Actions,
    options?: NonNullable<Parameters<typeof detectEthereumProvider>[0]>,
    connectEagerly = true
  ) {
    super(actions)
    this.options = options

    if (connectEagerly) {
      this.providerPromise = this.startListening(connectEagerly)
    }
  }

  private async startListening(connectEagerly: boolean): Promise<void> {
    await import('@metamask/detect-provider')
      .then((m) => m?.default ?? m)
      .then((detectEthereumProvider) => detectEthereumProvider(this.options))
      .then((provider) => {
        this.provider = (provider as Provider) ?? undefined

        if (this.provider) {
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
                if (accounts.length > 0) {
                  this.actions.update({ chainId: parseChainId(chainId), accounts })
                }
              })
              .catch((error) => {
                console.debug('Could not connect eagerly', error)
              })
          }
        }
      })
  }

  public async activate(): Promise<void> {
    this.actions.startActivation()

    if (!this.providerPromise) {
      this.providerPromise = this.startListening(false)
    }
    await this.providerPromise

    if (this.provider) {
      await Promise.all([
        this.provider.request({ method: 'eth_chainId' }) as Promise<string>,
        this.provider.request({ method: 'eth_requestAccounts' }) as Promise<string[]>,
      ])
        .then(([chainId, accounts]) => {
          this.actions.update({ chainId: Number.parseInt(chainId, 16), accounts })
        })
        .catch((error) => {
          this.actions.reportError(error)
        })
    } else {
      this.actions.reportError(new NoMetaMaskError())
    }
  }
}
