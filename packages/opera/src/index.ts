import type {
  Actions,
  Provider,
  ProviderConnectInfo,
  ProviderRpcError,
} from '@web3-react/types'
import { Connector } from '@web3-react/types'

type OperaProvider = (a: 'injected') => Provider

export class NoOperaError extends Error {
  public constructor() {
    super('Opera not installed')
    this.name = NoOperaError.name
    Object.setPrototypeOf(this, NoOperaError.prototype)
  }
}

function parseChainId(chainId: string) {
  return Number.parseInt(chainId, 16)
}

export class Opera extends Connector {
  /** {@inheritdoc Connector.provider} */
  // public provider: OperaProvider | undefined
  private providerPromise?: Promise<void>

 
  constructor(actions: Actions, connectEagerly = false) {
    super(actions)

    if (connectEagerly && typeof window === 'undefined') {
      throw new Error('connectEagerly = true is invalid for SSR, instead use the connectEagerly method in a useEffect')
    }
    if (connectEagerly) {
      this.providerPromise = this.startListening(connectEagerly)
    }
  }
  
  private async startListening(connectEagerly: boolean): Promise<void> {
    const cancelActivation = this.actions.startActivation()
    const ethProvider = await import('eth-provider').then((m: { default: OperaProvider }) => m.default)
    // this.provider = provider as OperaProvider
    try {
      this.provider = ethProvider('injected')
    } catch (error) {
      cancelActivation()
      throw error
    }

    if (this.provider) {
      this.provider.on('connect', ({ chainId }: ProviderConnectInfo): void => {
        this.actions.update({ chainId: parseChainId(chainId) })
      })
      this.provider.on('disconnect', (error: ProviderRpcError): void => {
        this.actions.resetState()
        this.onError?.(error)
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
            if (accounts?.length > 0) {
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
    const cancelActivation = this.actions.startActivation()

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
          this.actions.update({ chainId: parseChainId(chainId), accounts })
        })
        .catch((error) => {
          cancelActivation()
          throw error
        })
    } else {
      this.onError?.(new NoOperaError())
    }
  }
}
