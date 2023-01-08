import type { Actions, Provider, ProviderConnectInfo, ProviderRpcError } from '@web3-react/types'
import { Connector } from '@web3-react/types'

// BSC Wallet extension bugs:
// Will not give a rejection error if the user closes the modal without unlocking
// May stop emitting accountsChanged

type BscProvider = Provider & {
  chainId?: string
  autoRefreshOnNetworkChange?: boolean
  isConnected?: () => boolean
  switchNetwork?: (chainId: number) => void
}

declare global {
  interface Window {
    BinanceChain?: BscProvider
  }
}

type BscWalletOptions = {
  /** Whether or not to reload dapp automatically after switching chains, defaults to true */
  autoRefreshOnNetworkChange?: boolean
}

export class NoBscProviderError extends Error {
  public constructor() {
    super('BSC Wallet not installed')
    this.name = NoBscProviderError.name
    Object.setPrototypeOf(this, NoBscProviderError.prototype)
  }
}

/**
 * @param options - Options to pass to the "BinanceChain" provider.
 * @param onError - Handler to report errors thrown from eventListeners.
 */
export interface BscConstructorArgs {
  actions: Actions
  options?: BscWalletOptions
  onError?: (error: Error) => void
  supportedChainIds?: number[]
}

export class BscWallet extends Connector {
  /** {@inheritdoc Connector.provider} */
  public provider?: BscProvider

  private readonly options?: BscWalletOptions

  constructor({ actions, options, onError, supportedChainIds }: BscConstructorArgs) {
    super(actions, onError, supportedChainIds ?? [1, 56, 97])
    this.options = options
  }

  private isomorphicInitialize() {
    const provider = window?.BinanceChain as BscProvider

    if (provider) {
      this.provider = provider

      this.provider.on('connect', ({ chainId }: ProviderConnectInfo): void => {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        this.provider!.autoRefreshOnNetworkChange = this.options?.autoRefreshOnNetworkChange ?? true
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
        const handleChange = () => {
          if (accounts.length === 0) {
            this.actions.resetState()
          } else {
            this.actions.update({ accounts, accountIndex: accounts?.length ? 0 : undefined })
          }
        }

        void handleChange()
      })
    }
  }

  /** {@inheritdoc Connector.connectEagerly} */
  public async connectEagerly(): Promise<void> {
    const cancelActivation = this.actions.startActivation()

    this.isomorphicInitialize()

    if (!this.provider) return cancelActivation()

    return Promise.all([
      this.provider.request({ method: 'eth_chainId' }) as Promise<string>,
      this.provider.request({ method: 'eth_requestAccounts' }) as Promise<string[]>,
    ])
      .then(([chainId, accounts]) => {
        if (accounts?.length) {
          // BSC doesn't seem to let you use this function. Always returns that it can't find the chain.
          // Once it is supported, then this connector can be update to support changing chains.
          // this.provider.switchNetwork(0x38).catch((error) => console.log(error))

          this.actions.update({
            chainId: this.parseChainId(chainId),
            accounts,
            accountIndex: accounts?.length ? 0 : undefined,
          })
        } else {
          throw new Error('No accounts returned')
        }
      })
      .catch((error: ProviderRpcError) => {
        console.debug('Could not connect eagerly', error)
        cancelActivation?.()
      })
  }

  /**
   * Initiates a connection.
   */
  public async activate(): Promise<void> {
    // BSC Wallet extension will not throw a rejection error if the user closes the modal without unlocking.
    // Is there is no provider, we will assume the wallet is locked, in which we will not set "isActivating" via "startActivation()"
    // as the will be no rejection to set "isActivating" to falsy
    const cancelActivation = !this.provider || this.provider?.isConnected?.() ? null : this.actions.startActivation()

    this.isomorphicInitialize()

    if (!this.provider) throw new NoBscProviderError()

    return Promise.all([
      this.provider.request({ method: 'eth_chainId' }) as Promise<string>,
      this.provider.request({ method: 'eth_requestAccounts' }) as Promise<string[]>,
    ])
      .then(([chainId, accounts]) => {
        this.actions.update({
          chainId: this.parseChainId(chainId),
          accounts,
          accountIndex: accounts?.length ? 0 : undefined,
        })
      })
      .catch((error: ProviderRpcError) => {
        cancelActivation?.()
        throw error
      })
  }
}
