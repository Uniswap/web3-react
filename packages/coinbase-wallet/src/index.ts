import type { CoinbaseWalletProvider, CoinbaseWalletSDK } from '@coinbase/wallet-sdk'
import type {
  Actions,
  AddEthereumChainParameter,
  ProviderConnectInfo,
  ProviderRpcError,
  WatchAssetParameters,
} from '@web3-react/types'
import { Connector } from '@web3-react/types'

function parseChainId(chainId: string | number) {
  return typeof chainId === 'number' ? chainId : Number.parseInt(chainId, chainId.startsWith('0x') ? 16 : 10)
}

type CoinbaseWalletSDKOptions = ConstructorParameters<typeof CoinbaseWalletSDK>[0] & { url: string }

/**
 * @param options - Options to pass to `@coinbase/wallet-sdk`.
 * @param onError - Handler to report errors thrown from eventListeners.
 */
export interface CoinbaseWalletConstructorArgs {
  actions: Actions
  options: CoinbaseWalletSDKOptions
  onError?: (error: Error) => void
}

export class CoinbaseWallet extends Connector {
  /** {@inheritdoc Connector.provider} */
  public provider: CoinbaseWalletProvider | undefined

  private readonly options: CoinbaseWalletSDKOptions
  private eagerConnection?: Promise<void>

  /**
   * A `CoinbaseWalletSDK` instance.
   */
  public coinbaseWallet: CoinbaseWalletSDK | undefined

  constructor({ actions, options, onError }: CoinbaseWalletConstructorArgs) {
    super(actions, onError)
    this.options = options
  }

  // the `connected` property, is bugged, but this works as a hack to check connection status
  private get connected() {
    return !!this.provider?.selectedAddress
  }

  private async isomorphicInitialize(): Promise<void> {
    if (this.eagerConnection) return

    await (this.eagerConnection = import('@coinbase/wallet-sdk').then((m) => {
      const { url, ...options } = this.options
      this.coinbaseWallet = new m.default(options)
      this.provider = this.coinbaseWallet.makeWeb3Provider(url)

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
        if (accounts.length === 0) {
          // handle this edge case by disconnecting
          this.actions.resetState()
        } else {
          this.actions.update({ accounts })
        }
      })
    }))
  }

  /** {@inheritdoc Connector.connectEagerly} */
  public async connectEagerly(): Promise<void> {
    const cancelActivation = this.actions.startActivation()

    try {
      await this.isomorphicInitialize()

      if (!this.connected) throw new Error('No existing connection')

      return Promise.all([
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        this.provider!.request<string>({ method: 'eth_chainId' }),
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        this.provider!.request<string[]>({ method: 'eth_accounts' }),
      ]).then(([chainId, accounts]) => {
        if (!accounts.length) throw new Error('No accounts returned')
        this.actions.update({ chainId: parseChainId(chainId), accounts })
      })
    } catch (error) {
      cancelActivation()
      throw error
    }
  }

  /**
   * Initiates a connection and/or adds/switches chain.
   *
   * @param desiredChainIdOrChainParameters - If defined, indicates the desired chain to connect to. If the user is
   * already connected to this chain, no additional steps will be taken. Otherwise, the user will be prompted to switch
   * to the chain, if one of two conditions is met: either they already have it added, or the argument is of type
   * AddEthereumChainParameter, in which case the user will be prompted to add the chain with the specified parameters
   * first, before being prompted to switch.
   */
  public async activate(desiredChainIdOrChainParameters?: number | AddEthereumChainParameter): Promise<void> {
    const desiredChainId =
      typeof desiredChainIdOrChainParameters === 'number'
        ? desiredChainIdOrChainParameters
        : desiredChainIdOrChainParameters?.chainId

    // Add/Switch Chain if already connected
    if (this.connected) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      if (!desiredChainId || desiredChainId === parseChainId(this.provider!.chainId)) return

      // if we're here, we can try to switch networks
      this.actions.update({
        switchingChain: {
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          fromChainId: parseChainId(this.provider!.chainId),
          toChainId: desiredChainId,
        },
      })

      const desiredChainIdHex = `0x${desiredChainId.toString(16)}`

      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      return this.provider!.request<void>({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: desiredChainIdHex }],
      })
        .catch(async (switchingError: ProviderRpcError) => {
          if (switchingError.code === 4902 && typeof desiredChainIdOrChainParameters !== 'number') {
            // if we're here, we can try to add a new network
            this.actions.update({
              addingChain: {
                chainId: desiredChainId,
              },
            })

            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            return this.provider!.request<void>({
              method: 'wallet_addEthereumChain',
              params: [{ ...desiredChainIdOrChainParameters, chainId: desiredChainIdHex }],
            }).catch((addingError: ProviderRpcError) => {
              this.actions.update({ addingChain: undefined, switchingChain: undefined })
              throw addingError
            })
          }

          this.actions.update({ switchingChain: undefined })

          throw switchingError
        })
        .then(() => {
          this.actions.update({
            addingChain: undefined,
            switchingChain: undefined,
          })
        })
    }

    // If we're here, we are not connected
    const cancelActivation = this.actions.startActivation()

    try {
      await this.isomorphicInitialize()

      return Promise.all([
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        this.provider!.request<string>({ method: 'eth_chainId' }),
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        this.provider!.request<string[]>({ method: 'eth_requestAccounts' }),
      ])
        .then(([chainId, accounts]) => {
          const receivedChainId = parseChainId(chainId)

          if (!desiredChainId || desiredChainId === receivedChainId) {
            return this.actions.update({
              chainId: receivedChainId,
              accounts,
            })
          }

          // if we're here, we can try to switch networks
          this.actions.update({
            switchingChain: {
              fromChainId: parseChainId(chainId),
              toChainId: desiredChainId,
            },
          })

          const desiredChainIdHex = `0x${desiredChainId.toString(16)}`

          return this.provider
            ?.request<void>({
              method: 'wallet_switchEthereumChain',
              params: [{ chainId: desiredChainIdHex }],
            })
            .catch(async (switchingError: ProviderRpcError) => {
              if (switchingError.code === 4902 && typeof desiredChainIdOrChainParameters !== 'number') {
                // if we're here, we can try to add a new network
                this.actions.update({
                  addingChain: {
                    chainId: desiredChainId,
                  },
                })

                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                return this.provider!.request<void>({
                  method: 'wallet_addEthereumChain',
                  params: [{ ...desiredChainIdOrChainParameters, chainId: desiredChainIdHex }],
                }).catch((addingError: ProviderRpcError) => {
                  this.actions.update({ addingChain: undefined, switchingChain: undefined })
                  throw addingError
                })
              }

              this.actions.update({ switchingChain: undefined })

              throw switchingError
            })
            .then(() => {
              this.actions.update({ addingChain: undefined, switchingChain: undefined })
            })
        })
        .catch((error) => {
          cancelActivation()
          throw error
        })
    } catch (error) {
      cancelActivation()
      throw error
    }
  }

  /** {@inheritdoc Connector.deactivate} */
  public deactivate(): void {
    this.coinbaseWallet?.disconnect()
  }

  public async watchAsset({
    desiredChainIdOrChainParameters,
    address,
    symbol,
    decimals,
    image,
  }: Pick<WatchAssetParameters, 'address'> & Partial<Omit<WatchAssetParameters, 'address'>>): Promise<true> {
    if (!this.provider) throw new Error('No provider')

    this.actions.update({
      watchingAsset: {
        address,
        symbol: symbol ?? '',
        decimals: decimals ?? 0,
        image: image ?? '',
      },
    })

    // Switch to the correct chain to watch the asset
    if (desiredChainIdOrChainParameters) {
      const currentChainId = parseChainId(await this.provider.request({ method: 'eth_chainId' }))

      const desiredChainId =
        typeof desiredChainIdOrChainParameters === 'number'
          ? desiredChainIdOrChainParameters
          : desiredChainIdOrChainParameters?.chainId

      if (desiredChainId && desiredChainId !== currentChainId) {
        try {
          await this.activate(desiredChainIdOrChainParameters)
        } catch (error) {
          this.actions.update({ watchingAsset: undefined })
          return true
        }

        // We need a small delay before calling the next request to the provider or else it won't work.
        await new Promise((resolve) => {
          setTimeout(resolve, 200)
        })
      }
    }

    return this.provider
      .request({
        method: 'wallet_watchAsset',
        params: {
          type: 'ERC20',
          options: {
            address, // The address that the token is at.
            symbol, // A ticker symbol or shorthand, up to 5 chars.
            decimals, // The number of decimals in the token
            image, // A string url of the token logo
          },
        },
      })
      .catch(() => {
        this.actions.update({ watchingAsset: undefined })
      })
      .then((success) => {
        this.actions.update({ watchingAsset: undefined })
        if (!success) throw new Error('Rejected')
        return true
      })
  }
}
