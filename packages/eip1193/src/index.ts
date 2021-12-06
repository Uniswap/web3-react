import { Actions, Connector, Provider } from '@web3-react/types'

function parseChainId(chainId: string) {
  return Number.parseInt(chainId, 16)
}

export class EIP1193 extends Connector {
  provider: Provider

  constructor(actions: Actions, provider: Provider, connectEagerly = true) {
    super(actions)

    this.provider = provider

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
      this.initialize()
    }
  }

  private async initialize() {
    this.actions.startActivation()

    Promise.all([
      this.provider.request({ method: 'eth_chainId' }) as Promise<string>,
      this.provider.request({ method: 'eth_accounts' }) as Promise<string[]>,
    ])
      .then(([chainId, accounts]) => {
        this.actions.update({ chainId: parseChainId(chainId), accounts })
      })
      .catch((error) => {
        console.debug('Could not connect eagerly', error)
        this.actions.reset()
      })
  }

  public async activate(): Promise<void> {
    this.actions.startActivation()

    return Promise.all([
      this.provider.request({ method: 'eth_chainId' }) as Promise<string>,
      this.provider.request({ method: 'eth_requestAccounts' }) as Promise<string[]>,
    ])
      .then(([chainId, accounts]) => {
        this.actions.update({ chainId: parseChainId(chainId), accounts })
      })
      .catch((error) => {
        this.actions.reportError(error)
      })
  }
}
