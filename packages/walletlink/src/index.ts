import type { CoinbaseWalletProvider, CoinbaseWalletSDK } from '@coinbase/wallet-sdk'
import type { Actions, AddEthereumChainParameter, ProviderConnectInfo, ProviderRpcError } from '@web3-react/types'
import { Connector } from '@web3-react/types'

function parseChainId(chainId: string | number) {
  return typeof chainId === 'number' ? chainId : Number.parseInt(chainId, chainId.startsWith('0x') ? 16 : 10)
}

type CoinbaseWalletSDKOptions = ConstructorParameters<typeof CoinbaseWalletSDK>[0] & { url: string }

export class WalletLink extends Connector {
  /** {@inheritdoc Connector.provider} */
  public provider: CoinbaseWalletProvider | undefined

  private readonly options: CoinbaseWalletSDKOptions
  private eagerConnection?: Promise<void>

  /**
   * A `walletlink` instance.
   */
  public walletLink: CoinbaseWalletSDK | undefined

  /**
   * @param options - Options to pass to `walletlink`
   * @param connectEagerly - A flag indicating whether connection should be initiated when the class is constructed.
   */
  constructor(actions: Actions, options: CoinbaseWalletSDKOptions, connectEagerly = false) {
    super(actions)

    if (connectEagerly && typeof window === 'undefined') {
      throw new Error('connectEagerly = true is invalid for SSR, instead use the connectEagerly method in a useEffect')
    }

    this.options = options

    if (connectEagerly) void this.connectEagerly()
  }

  // the `connected` property, is bugged, but this works as a hack to check connection status
  private get connected() {
    return !!this.provider?.selectedAddress
  }

  private async isomorphicInitialize(): Promise<void> {
    if (this.eagerConnection) return this.eagerConnection

    await (this.eagerConnection = import('@coinbase/wallet-sdk').then((m) => {
      const { url, ...options } = this.options
      this.walletLink = new m.default(options)
      this.provider = this.walletLink.makeWeb3Provider(url)

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
    }))
  }

  /** {@inheritdoc Connector.connectEagerly} */
  public async connectEagerly(): Promise<void> {
    const cancelActivation = this.actions.startActivation()

    await this.isomorphicInitialize()

    if (this.connected) {
      return Promise.all([
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        this.provider!.request<string>({ method: 'eth_chainId' }),
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        this.provider!.request<string[]>({ method: 'eth_accounts' }),
      ])
        .then(([chainId, accounts]) => {
          if (accounts.length) {
            this.actions.update({ chainId: parseChainId(chainId), accounts })
          } else {
            throw new Error('No accounts returned')
          }
        })
        .catch((error) => {
          console.debug('Could not connect eagerly', error)
          cancelActivation()
        })
    } else {
      cancelActivation()
    }
  }

  /**
   * Initiates a connection.
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

    if (this.connected) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      if (!desiredChainId || desiredChainId === parseChainId(this.provider!.chainId)) return

      const desiredChainIdHex = `0x${desiredChainId.toString(16)}`
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      return this.provider!.request<void>({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: desiredChainIdHex }],
      })
        .catch(async (error: ProviderRpcError) => {
          if (error.code === 4902 && typeof desiredChainIdOrChainParameters !== 'number') {
            // if we're here, we can try to add a new network
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            return this.provider!.request<void>({
              method: 'wallet_addEthereumChain',
              params: [{ ...desiredChainIdOrChainParameters, chainId: desiredChainIdHex }],
            })
          } else {
            throw error
          }
        })
        .catch((error: ProviderRpcError) => {
          this.actions.reportError(error)
        })
    }

    this.actions.startActivation()
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
          return this.actions.update({ chainId: receivedChainId, accounts })
        }

        // if we're here, we can try to switch networks
        const desiredChainIdHex = `0x${desiredChainId.toString(16)}`
        return this.provider
          ?.request<void>({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: desiredChainIdHex }],
          })
          .catch(async (error: ProviderRpcError) => {
            if (error.code === 4902 && typeof desiredChainIdOrChainParameters !== 'number') {
              // if we're here, we can try to add a new network
              // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
              return this.provider!.request<void>({
                method: 'wallet_addEthereumChain',
                params: [{ ...desiredChainIdOrChainParameters, chainId: desiredChainIdHex }],
              })
            } else {
              throw error
            }
          })
      })
      .catch((error: Error) => {
        this.actions.reportError(error)
      })
  }

  /** {@inheritdoc Connector.deactivate} */
  public deactivate(): void {
    this.walletLink?.disconnect()
  }
}
