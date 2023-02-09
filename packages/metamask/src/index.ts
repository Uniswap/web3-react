import type detectEthereumProvider from '@metamask/detect-provider'
import type {
  AddEthereumChainParameter,
  ConnectorArgs,
  PermissionCaveat,
  Provider,
  ProviderConnectInfo,
  WatchAssetParameters,
  Web3WalletPermission,
} from '@web3-react/types'
import { ProviderRpcError, Web3ReactState } from '@web3-react/types'
import { Connector } from '@web3-react/types'

type MetaMaskProvider = Provider & {
  isMetaMask?: boolean
  isConnected?: () => boolean
  providers?: MetaMaskProvider[]
  selectedAddress?: string
  get chainId(): string
  get accounts(): string[]
}

export class NoMetaMaskError extends Error {
  public constructor() {
    super('MetaMask not installed')
    this.name = NoMetaMaskError.name
    Object.setPrototypeOf(this, NoMetaMaskError.prototype)
  }
}

/**
 * @param options - Options to pass to `@metamask/detect-provider`
 * @param onError - Handler to report errors thrown from eventListeners.
 */
export interface MetaMaskConstructorArgs extends ConnectorArgs {
  options?: Parameters<typeof detectEthereumProvider>[0]
}

export class MetaMask extends Connector {
  /** {@inheritdoc Connector.provider} */
  public provider?: MetaMaskProvider

  private readonly options?: Parameters<typeof detectEthereumProvider>[0]
  private eagerConnection?: Promise<void>

  constructor({ actions, options, onError, connectorOptions }: MetaMaskConstructorArgs) {
    super(actions, onError, connectorOptions)
    this.options = options
  }

  private get selectedAddress() {
    return this.provider?.selectedAddress
  }

  /**
   * Get all connected accounts per EIP-2255.
   */
  private async getAccounts(): Promise<string[] | undefined> {
    try {
      const permissions: Web3WalletPermission[] = ((await this.provider?.request({
        method: 'wallet_getPermissions',
      })) || []) as Web3WalletPermission[]

      // Get the account permissions
      const accountsPermission = permissions.find(
        (permission) => permission?.parentCapability === 'eth_accounts'
      ) as Web3WalletPermission

      // Extract the accounts
      const accounts =
        accountsPermission?.caveats?.find((caveat: PermissionCaveat) => caveat.type === 'restrictReturnedAccounts')
          ?.value ?? undefined

      return accounts
    } catch (error) {
      return undefined
    }
  }

  /**
   * Setup the provider and listen to its events.
   */
  private async isomorphicInitialize(): Promise<void> {
    if (this.eagerConnection) return

    return (this.eagerConnection = import('@metamask/detect-provider').then(async (m) => {
      const provider = await m.default(this.options)
      if (provider) {
        this.provider = provider as MetaMaskProvider

        // handle the case when e.g. metamask and coinbase wallet are both installed
        if (this.provider.providers?.length) {
          this.provider = this.provider.providers.find((p) => p.isMetaMask) ?? this.provider.providers[0]
        }

        this.provider.on('connect', ({ chainId }: ProviderConnectInfo): void => {
          this.actions.update({ chainId: this.parseChainId(chainId) })
        })

        this.provider.on('disconnect', (error: ProviderRpcError): void => {
          // 1013 indicates that MetaMask is attempting to reestablish the connection
          // https://github.com/MetaMask/providers/releases/tag/v8.0.0
          if (error.code === 1013) {
            console.debug('MetaMask logged connection error 1013: "Try again later"')
            return
          }

          this.actions.resetState()
          this.onError?.(error)
        })

        this.provider.on('chainChanged', (chainId: string): void => {
          this.actions.update({ chainId: this.parseChainId(chainId) })
        })

        this.provider.on('accountsChanged', (baseAccounts: string[]): void => {
          const handleChange = async () => {
            const accounts = (await this.getAccounts()) ?? baseAccounts
            if (accounts.length === 0) {
              // handle this edge case by disconnecting
              this.actions.resetState()
            } else {
              const index = accounts.indexOf(this?.selectedAddress ?? '')
              this.actions.update({ accounts, accountIndex: index < 0 ? undefined : index })
            }
          }

          void handleChange()
        })
      }
    }))
  }

  /** {@inheritdoc Connector.connectEagerly} */
  public async connectEagerly(): Promise<Web3ReactState> {
    const cancelActivation = this.actions.startActivation()

    try {
      await this.isomorphicInitialize()
      if (!this.provider) return cancelActivation()

      // Wallets may resolve eth_chainId and hang on eth_accounts pending user interaction, which may include changing
      // chains; they should be requested serially, with accounts first, so that the chainId can settle.
      const baseAccounts = (await this.provider.request({ method: 'eth_accounts' })) as string[]
      if (!baseAccounts.length) throw new Error('No accounts returned')

      const accounts = (await this.getAccounts()) ?? baseAccounts
      if (!accounts.length) throw new Error('No accounts returned')

      const chainId = (await this.provider.request({ method: 'eth_chainId' })) as string

      const index = accounts.indexOf(this?.selectedAddress ?? '')

      return this.actions.update({
        chainId: this.parseChainId(chainId),
        accounts,
        accountIndex: index < 0 ? undefined : index,
      })
    } catch (error) {
      console.debug('Could not connect eagerly', error)
      // we should be able to use `cancelActivation` here, but on mobile, metamask emits a 'connect'
      // event, meaning that chainId is updated, and cancelActivation doesn't work because an intermediary
      // update has occurred, so we reset state instead
      return this.actions.resetState()
    }
  }

  /**
   * Initiates a connection and/or adds/switches chain.
   *
   * @param desiredChainIdOrChainParameters - If defined, indicates the desired chain to connect to. If the user is
   * already connected to this chain, no additional steps will be taken. Otherwise, the user will be prompted to switch
   * to the chain, if one of two conditions is met: either they already have it added in their extension, or the
   * argument is of type AddEthereumChainParameter, in which case the user will be prompted to add the chain with the
   * specified parameters first, before being prompted to switch.
   */
  public async activate(desiredChainIdOrChainParameters?: number | AddEthereumChainParameter): Promise<Web3ReactState> {
    const cancelActivation = this.selectedAddress ? null : this.actions.startActivation()

    try {
      await this.isomorphicInitialize()

      if (!this.provider) throw new NoMetaMaskError()

      const baseAccounts = (await this.provider.request({ method: 'eth_requestAccounts' })) as string[]

      // Check if we have access to get all connected accounts as per EIP-2255
      const accounts: string[] = (await this.getAccounts()) ?? baseAccounts

      // Get the account index
      const index = accounts.indexOf(this?.selectedAddress ?? '')

      // Request chainId after account request, incase user changes chain during process
      const currentChainId = this.parseChainId((await this.provider.request({ method: 'eth_chainId' })) as string)

      const desiredChainId =
        typeof desiredChainIdOrChainParameters === 'number'
          ? desiredChainIdOrChainParameters
          : desiredChainIdOrChainParameters?.chainId

      // We're on the chainId we need, go ahead and connect
      if (!desiredChainId || currentChainId === desiredChainId) {
        return this.actions.update({
          chainId: currentChainId,
          accounts,
          accountIndex: index < 0 ? undefined : index,
        })
      }

      // Attempt to add/switch the chain to the desired chain
      await this.switchChain(desiredChainId, currentChainId)

      // Reattempt connection now being on the correct chainId
      return this.activate(desiredChainId)
    } catch (error) {
      cancelActivation?.()
      throw error
    }
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
  }: WatchAssetParameters): Promise<boolean> {
    if (!this.provider) throw new Error('No provider')

    this.actions.update({
      watchingAsset: {
        address,
        symbol,
        decimals,
        image,
      },
    })

    // Switch to the correct chain to watch the asset
    if (desiredChainIdOrChainParameters) {
      const currentChainId = this.parseChainId((await this.provider.request({ method: 'eth_chainId' })) as string)

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

        // We need a small delay before calling the next request to the provider or else it will prevent the user request popup and queue up the tokens to be added.
        await new Promise((resolve) => {
          setTimeout(resolve, 100)
        })
      }
    }

    try {
      const success = await this.provider.request({
        method: 'wallet_watchAsset',
        params: {
          type: 'ERC20', // Initially only supports ERC20, but eventually more!
          options: {
            address, // The address that the token is at.
            symbol, // A ticker symbol or shorthand, up to 5 chars.
            decimals, // The number of decimals in the token
            image, // A string url of the token logo
          },
        },
      })

      this.actions.update({ watchingAsset: undefined })
      if (!success) throw new Error('Rejected')
      return true
    } catch (error) {
      this.actions.update({ watchingAsset: undefined })
      return true
    }
  }
}
