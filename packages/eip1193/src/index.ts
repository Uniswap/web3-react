import type { ConnectorArgs, Provider, ProviderConnectInfo, ProviderRpcError, Web3ReactState } from '@web3-react/types'
import { Connector } from '@web3-react/types'

/**
 * @param provider - An EIP-1193 ({@link https://github.com/ethereum/EIPs/blob/master/EIPS/eip-1193.md}) provider.
 * @param onError - Handler to report errors thrown from eventListeners.
 */
export interface EIP1193ConstructorArgs extends ConnectorArgs {
  provider: Provider
}

export class EIP1193 extends Connector {
  /** {@inheritdoc Connector.provider} */
  provider: Provider

  constructor({ actions, provider, onError, connectorOptions }: EIP1193ConstructorArgs) {
    super(actions, onError, connectorOptions)

    this.provider = provider

    this.provider.on('connect', ({ chainId }: ProviderConnectInfo): void => {
      this.actions.update({ chainId: this.parseChainId(chainId) })
    })

    this.provider.on('disconnect', (error: ProviderRpcError): void => {
      this.actions.resetState()
      this.onError?.(error)
    })

    this.provider.on('chainChanged', (chainId: string): void => {
      this.actions.update({ chainId: this.parseChainId(chainId) })
    })

    this.provider.on('accountsChanged', (accounts: string[]): void => {
      this.actions.update({ accounts })
    })
  }

  private async activateAccounts(requestAccounts: () => Promise<string[]>): Promise<Web3ReactState> {
    const cancelActivation = this.actions.startActivation()

    try {
      // Wallets may resolve eth_chainId and hang on eth_accounts pending user interaction, which may include changing
      // chains; they should be requested serially, with accounts first, so that the chainId can settle.
      const accounts = await requestAccounts()
      const chainId = (await this.provider.request({ method: 'eth_chainId' })) as string
      return this.actions.update({ chainId: this.parseChainId(chainId), accounts })
    } catch (error) {
      cancelActivation()
      throw error
    }
  }

  /** {@inheritdoc Connector.connectEagerly} */
  public async connectEagerly(): Promise<Web3ReactState> {
    return this.activateAccounts(() => this.provider.request({ method: 'eth_accounts' }) as Promise<string[]>)
  }

  /** {@inheritdoc Connector.activate} */
  public async activate(): Promise<Web3ReactState> {
    return this.activateAccounts(
      () =>
        this.provider
          .request({ method: 'eth_requestAccounts' })
          .catch(() => this.provider.request({ method: 'eth_accounts' })) as Promise<string[]>
    )
  }
}
