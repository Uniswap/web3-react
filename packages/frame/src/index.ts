import { Actions, Connector, Provider } from '@web3-react/types'

function parseChainId(chainId: string) {
  return Number.parseInt(chainId, 16)
}

export class Frame extends Connector {
  private readonly options?: any
  private providerPromise?: Promise<void>

  constructor(actions: Actions, options?: any, connectEagerly = true) {
    super(actions)
    this.options = options

    if (connectEagerly) {
      this.providerPromise = this.startListening(connectEagerly)
    }
  }

  private async startListening(connectEagerly: boolean): Promise<void> {
    const provider = await import('eth-provider').then((m) => m?.default ?? m)

    this.provider = provider(['frame'], this.options)

    if (this.provider) {
      // TODO fix
      // this.provider.on('connect', ({ chainId }: { chainId: string }): void => {
      //   this.actions.update({ chainId: parseChainId(chainId) })
      // })
      // this.provider.on('disconnect', (error: Error): void => {
      //   console.log('here', error)
      //   this.actions.reportError(error)
      // })
      // this.provider.on('chainChanged', (chainId: string): void => {
      //   this.actions.update({ chainId: parseChainId(chainId) })
      // })
      this.provider.on('accountsChanged', (accounts: string[]): void => {
        this.actions.update({ accounts })
      })

      if (connectEagerly) {
        await Promise.all([
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
  }

  public async activate(): Promise<void> {
    this.actions.startActivation()

    if (!this.providerPromise) {
      this.providerPromise = this.startListening(false)
    }
    await this.providerPromise
    // this.provider guaranteed to be defined now

    await Promise.all([
      (this.provider as Provider).request({ method: 'eth_chainId' }) as Promise<string>,
      (this.provider as Provider).request({ method: 'eth_requestAccounts' }) as Promise<string[]>,
    ])
      .then(([chainId, accounts]) => {
        this.actions.update({ chainId: parseChainId(chainId), accounts })
      })
      .catch((error) => {
        this.actions.reportError(error)
      })
  }

  // TODO fix
  // public async deactivate(): Promise<void> {
  //   if (this.provider) {
  //     await (this.provider as any).close()
  //   }
  // }
}
