import type { CoinbaseWalletProvider, CoinbaseWalletSDK } from '@coinbase/wallet-sdk'
import type { LogoType } from '@coinbase/wallet-sdk/dist/assets/wallet-logo'
import type {
  ConnectorArgs,
  AddEthereumChainParameter,
  ProviderConnectInfo,
  ProviderRpcError,
  WatchAssetParameters,
} from '@web3-react/types'
import { Connector, Web3ReactState } from '@web3-react/types'

type CoinbaseWalletSDKOptions = ConstructorParameters<typeof CoinbaseWalletSDK>[0] & { url: string }

/**
 * @param options - Options to pass to `@coinbase/wallet-sdk`.
 * @param onError - Handler to report errors thrown from eventListeners.
 */
export interface CoinbaseWalletConstructorArgs extends ConnectorArgs {
  options: CoinbaseWalletSDKOptions
}

export class NoCoinbaseWalletError extends Error {
  public constructor() {
    super('Coinbase not installed')
    this.name = NoCoinbaseWalletError.name
    Object.setPrototypeOf(this, NoCoinbaseWalletError.prototype)
  }
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

  constructor({ actions, options, onError, connectorOptions }: CoinbaseWalletConstructorArgs) {
    super(actions, onError, connectorOptions)
    this.options = options
  }

  // the `connected` property, is bugged, but this works as a hack to check connection status
  private get selectedAddress() {
    return this.provider?.selectedAddress
  }

  /**
   * Setup the provider and listen to its events.
   */
  private async isomorphicInitialize(): Promise<void> {
    if (this.eagerConnection) return

    await (this.eagerConnection = import('@coinbase/wallet-sdk').then((m) => {
      const { url, ...options } = this.options
      this.coinbaseWallet = new m.default(options)
      this.provider = this.coinbaseWallet.makeWeb3Provider(url)

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
        if (accounts.length === 0) {
          // handle this edge case by disconnecting
          this.actions.resetState()
        } else {
          this.actions.update({ accounts, accountIndex: accounts?.length ? 0 : undefined })
        }
      })
    }))
  }

  /** {@inheritdoc Connector.connectEagerly} */
  public async connectEagerly(): Promise<Web3ReactState> {
    const cancelActivation = this.actions.startActivation()

    try {
      await this.isomorphicInitialize()
      if (!this.provider || !this.selectedAddress) throw new Error('No existing connection')

      // Wallets may resolve eth_chainId and hang on eth_accounts pending user interaction, which may include changing
      // chains; they should be requested serially, with accounts first, so that the chainId can settle.
      const accounts = await this.provider.request<string[]>({ method: 'eth_accounts' })
      if (!accounts.length) throw new Error('No accounts returned')
      const chainId = await this.provider.request<string>({ method: 'eth_chainId' })
      return this.actions.update({ chainId: this.parseChainId(chainId), accounts })
    } catch (error) {
      return cancelActivation()
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
  public async activate(desiredChainIdOrChainParameters?: number | AddEthereumChainParameter): Promise<Web3ReactState> {
    const cancelActivation = this.selectedAddress ? null : this.actions.startActivation()

    await this.isomorphicInitialize()

    if (!this.provider) throw new NoCoinbaseWalletError()

    const desiredChainId =
      typeof desiredChainIdOrChainParameters === 'number'
        ? desiredChainIdOrChainParameters
        : desiredChainIdOrChainParameters?.chainId

    try {
      const currentChainId = this.parseChainId(await this.provider.request({ method: 'eth_chainId' }))

      // Already connected
      if (this.selectedAddress) {
        // Add/switch chain
        if (desiredChainIdOrChainParameters && currentChainId !== desiredChainId) {
          await this.switchChain(desiredChainIdOrChainParameters, currentChainId)
        }

        return this.actions.getState()
      }

      // We're on the chainId we need, go ahead and connect
      if (!desiredChainIdOrChainParameters || !desiredChainId || currentChainId === desiredChainId) {
        const accounts: string[] = await this.provider.request({ method: 'eth_requestAccounts' })

        const index = accounts.indexOf(this?.selectedAddress ?? '')

        return this.actions.update({
          chainId: currentChainId,
          accounts,
          accountIndex: index < 0 ? undefined : index,
        })
      }

      // Attempt to add/switch the chain to the desired chain
      await this.switchChain(desiredChainIdOrChainParameters, currentChainId)

      // Reattempt connection now being on the correct chainId
      return this.activate(desiredChainId)
    } catch (error) {
      cancelActivation?.()
      throw error
    }
  }

  /** {@inheritdoc Connector.deactivate} */
  public deactivate(): void {
    this.coinbaseWallet?.disconnect()
  }

  public getWalletLogoUrl?(type: LogoType, width?: number): string | undefined {
    return this.coinbaseWallet?.getCoinbaseWalletLogo(type, width)
  }

  /**
   *
   * @param desiredChainIdOrChainParameters - The chainId or the chainIds parameters to add. You must provider the parameters if they were not passed to the connectors constructor.
   */
  public async addChain(desiredChainIdOrChainParameters: number | AddEthereumChainParameter) {
    const desiredChainId =
      typeof desiredChainIdOrChainParameters === 'number'
        ? desiredChainIdOrChainParameters
        : desiredChainIdOrChainParameters?.chainId

    const desiredChainIdHex = this.formatChainId(desiredChainId)

    try {
      if (!this.provider) throw Error('No provider found.')

      // Check if the params have been provided
      if (typeof desiredChainIdOrChainParameters !== 'number') {
        await this.provider.request({
          method: 'wallet_addEthereumChain',
          params: [{ ...desiredChainIdOrChainParameters, chainId: desiredChainIdHex }],
        })
      }
      // Check if the params were given to the connectors options
      else if (this.chainParameters && Object.keys(this.chainParameters).includes(String(desiredChainId))) {
        await this.provider.request({
          method: 'wallet_addEthereumChain',
          params: [{ ...this.chainParameters[desiredChainId], chainId: desiredChainIdHex }],
        })
      }

      this.actions.update({ addingChain: undefined, switchingChain: undefined })
    } catch (addingError) {
      this.actions.update({ addingChain: undefined, switchingChain: undefined })
      throw addingError
    }
  }

  /**
   * Switch the chainId of the connector. If the chainId is not configured in the wallet, it will attempt to add the chainId parameters, then switch to the chainId. You must provider the parameters if they were not passed to the connectors constructor.
   * @param desiredChainIdOrChainParameters - The chainId or the chainIds parameters to switch to
   * @param currentChainId - The current chainId we are switching from
   */
  public async switchChain(
    desiredChainIdOrChainParameters: number | AddEthereumChainParameter,
    currentChainId?: number
  ) {
    const desiredChainId =
      typeof desiredChainIdOrChainParameters === 'number'
        ? desiredChainIdOrChainParameters
        : desiredChainIdOrChainParameters?.chainId
    const desiredChainIdHex = this.formatChainId(desiredChainId)

    this.actions.update({
      switchingChain: {
        fromChainId: currentChainId,
        toChainId: desiredChainId,
      },
    })

    try {
      if (!this.provider) throw Error('No provider found.')

      await this.provider.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: desiredChainIdHex }],
      })

      this.actions.update({ addingChain: undefined, switchingChain: undefined })
    } catch (switchingError) {
      if ((switchingError as ProviderRpcError)?.code === 4902) {
        await this.addChain(desiredChainIdOrChainParameters)
      } else {
        throw switchingError
      }
    }
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
      const currentChainId = this.parseChainId(await this.provider.request({ method: 'eth_chainId' }))

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
