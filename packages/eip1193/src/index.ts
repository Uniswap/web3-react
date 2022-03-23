import type { Actions, Provider, ProviderConnectInfo, ProviderRpcError } from '@web3-react/types'
import { Connector } from '@web3-react/types'

function parseChainId(chainId: string) {
  return Number.parseInt(chainId, 16)
}

export class EIP1193 extends Connector {
  /** {@inheritdoc Connector.provider} */
  provider: Provider

  /**
   * @param provider - An EIP-1193 ({@link https://github.com/ethereum/EIPs/blob/master/EIPS/eip-1193.md}) provider.
   * @param connectEagerly - A flag indicating whether connection should be initiated when the class is constructed.
   */
  constructor(actions: Actions, provider: Provider, connectEagerly = false) {
    super(actions)

    if (connectEagerly && typeof window === 'undefined') {
      throw new Error('connectEagerly = true is invalid for SSR, instead use the connectEagerly method in a useEffect')
    }

    this.provider = provider

    this.provider.on('connect', ({ chainId }: ProviderConnectInfo): void => {
      this.actions.update({ chainId: parseChainId(chainId) })
    })

    this.provider.on('disconnect', (error: ProviderRpcError): void => {
      this.actions.reportError(error)
    })

    this.provider.on('chainChanged', (chainId: string): void => {
      this.actions.update({ chainId: parseChainId(chainId) })
    })

    this.provider.on('accountsChanged', (accounts: string[]): void => {
      this.actions.update({ accounts })
    })

    if (connectEagerly) void this.connectEagerly()
  }

  /** {@inheritdoc Connector.connectEagerly} */
  public async connectEagerly(): Promise<void> {
    const cancelActivation = this.actions.startActivation()

    return Promise.all([
      this.provider.request({ method: 'eth_chainId' }) as Promise<string>,
      this.provider.request({ method: 'eth_accounts' }) as Promise<string[]>,
    ])
      .then(([chainId, accounts]) => {
        this.actions.update({ chainId: parseChainId(chainId), accounts })
      })
      .catch((error) => {
        console.debug('Could not connect eagerly', error)
        cancelActivation()
      })
  }

  /** {@inheritdoc Connector.activate} */
  public async activate(): Promise<void> {
    this.actions.startActivation()

    return Promise.all([
      this.provider.request({ method: 'eth_chainId' }) as Promise<string>,
      this.provider
        .request({ method: 'eth_requestAccounts' })
        .catch(() => this.provider.request({ method: 'eth_accounts' })) as Promise<string[]>,
    ])
      .then(([chainId, accounts]) => {
        this.actions.update({ chainId: parseChainId(chainId), accounts })
      })
      .catch((error: Error) => {
        this.actions.reportError(error)
      })
  }
}
