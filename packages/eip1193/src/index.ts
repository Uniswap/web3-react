import type { Actions, Provider, ProviderConnectInfo, ProviderRpcError } from '@web3-react/types'
import { Connector } from '@web3-react/types'

function parseChainId(chainId: string | number) {
  return typeof chainId === 'string' ? Number.parseInt(chainId, 16) : chainId
}

/**
 * @param provider - An EIP-1193 ({@link https://github.com/ethereum/EIPs/blob/master/EIPS/eip-1193.md}) provider.
 * @param onError - Handler to report errors thrown from eventListeners.
 */
export interface EIP1193ConstructorArgs {
  actions: Actions
  provider: Provider
  onError?: (error: Error) => void
}

export class EIP1193 extends Connector {
  /** {@inheritdoc Connector.provider} */
  provider: Provider

  /** Cached state, used to observe any *Changed events while requesting data. */
  private chainId?: string
  private accounts?: string[]

  constructor({ actions, provider, onError }: EIP1193ConstructorArgs) {
    super(actions, onError)

    this.provider = provider

    this.provider.on('connect', ({ chainId }: ProviderConnectInfo): void => {
      this.actions.update({ chainId: parseChainId(chainId) })
    })

    this.provider.on('disconnect', (error: ProviderRpcError): void => {
      this.actions.resetState()
      this.onError?.(error)
    })

    this.provider.on('chainChanged', (chainId: string): void => {
      this.actions.update({ chainId: parseChainId(chainId) })
      this.chainId = chainId
    })

    this.provider.on('accountsChanged', (accounts: string[]): void => {
      this.actions.update({ accounts })
      this.accounts = accounts
    })
  }

  private async connect(eager: boolean): Promise<void> {
    const cancelActivation = this.actions.startActivation()

    // Observe any *Changed events which update the data after it has been requested.
    this.chainId = this.accounts = undefined
    return Promise.all([
      this.provider.request({ method: 'eth_chainId' }) as Promise<string>,
      (eager ? this.provider.request({ method: 'eth_requestAccounts' }) : this.provider
        .request({ method: 'eth_requestAccounts' })
        .catch(() => this.provider.request({ method: 'eth_accounts' }))) as Promise<string[]>,
    ])
      .then(([chainId, accounts]) => {
        chainId = this.chainId ?? chainId
        accounts = this.accounts ?? accounts
        this.actions.update({ chainId: parseChainId(chainId), accounts })
      })
      .catch((error) => {
        cancelActivation()
        throw error
      })
  }

  /** {@inheritdoc Connector.connectEagerly} */
  public async connectEagerly(): Promise<void> {
    return this.connect(true)
  }

  /** {@inheritdoc Connector.activate} */
  public async activate(): Promise<void> {
    return this.connect(false)
  }
}
