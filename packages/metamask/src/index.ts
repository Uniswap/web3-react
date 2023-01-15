import type detectEthereumProvider from '@metamask/detect-provider'
import type {
  ConnectorArgs,
  AddEthereumChainParameter,
  Provider,
  ProviderConnectInfo,
  ProviderRpcError,
  WatchAssetParameters,
  Web3WalletPermission,
  PermissionCaveat,
} from '@web3-react/types'
import { Connector } from '@web3-react/types'

type MetaMaskProvider = Provider & {
  isMetaMask?: boolean
  isConnected?: () => boolean
  providers?: MetaMaskProvider[]
  selectedAddress?: string
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
  public async connectEagerly(): Promise<void> {
    const cancelActivation = this.actions.startActivation()

    await this.isomorphicInitialize()
    if (!this.provider) return cancelActivation()

    return Promise.all([
      this.provider.request({ method: 'eth_chainId' }) as Promise<string>,
      this.provider.request({ method: 'eth_accounts' }) as Promise<string[]>,
    ])
      .then(async ([chainId, baseAccounts]) => {
        const accounts = (await this.getAccounts()) ?? baseAccounts

        if (accounts.length) {
          const index = accounts.indexOf(this?.selectedAddress ?? '')
          this.actions.update({
            chainId: this.parseChainId(chainId),
            accounts,
            accountIndex: index < 0 ? undefined : index,
          })
          // void this.startBlockListenerr(this.provider, accounts)
        } else {
          throw new Error('No accounts returned')
        }
      })
      .catch((error) => {
        console.debug('Could not connect eagerly', error)
        // we should be able to use `cancelActivation` here, but on mobile, metamask emits a 'connect'
        // event, meaning that chainId is updated, and cancelActivation doesn't work because an intermediary
        // update has occurred, so we reset state instead
        this.actions.resetState()
      })
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
  public async activate(desiredChainIdOrChainParameters?: number | AddEthereumChainParameter): Promise<void> {
    const cancelActivation = this.selectedAddress ? null : this.actions.startActivation()

    return this.isomorphicInitialize()
      .then(async () => {
        if (!this.provider) throw new NoMetaMaskError()

        return Promise.all([
          this.provider.request({ method: 'eth_chainId' }) as Promise<string>,
          this.provider.request({ method: 'eth_requestAccounts' }) as Promise<string[]>,
        ]).then(async ([chainId, baseAccounts]) => {
          const accounts: string[] = (await this.getAccounts()) ?? baseAccounts

          const receivedChainId = this.parseChainId(chainId)
          const desiredChainId =
            typeof desiredChainIdOrChainParameters === 'number'
              ? desiredChainIdOrChainParameters
              : desiredChainIdOrChainParameters?.chainId

          // if there's no desired chain, or it's equal to the received, update
          if (!desiredChainId || receivedChainId === desiredChainId) {
            const index = accounts.indexOf(this?.selectedAddress ?? '')
            return this.actions.update({
              chainId: receivedChainId,
              accounts,
              accountIndex: index < 0 ? undefined : index,
            })
          }

          // if we're here, we can try to switch networks
          this.actions.update({
            switchingChain: {
              fromChainId: receivedChainId,
              toChainId: desiredChainId,
            },
          })

          const desiredChainIdHex = this.formatChainId(desiredChainId)

          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          return this.provider
            ?.request({
              method: 'wallet_switchEthereumChain',
              params: [{ chainId: desiredChainIdHex }],
            })
            .catch((switchingError: ProviderRpcError) => {
              if (switchingError.code === 4902) {
                // if we're here, we can try to add a new network

                // Check if the params have been provided
                if (typeof desiredChainIdOrChainParameters !== 'number') {
                  this.actions.update({
                    addingChain: {
                      chainId: desiredChainId,
                    },
                  })

                  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                  return this.provider!.request({
                    method: 'wallet_addEthereumChain',
                    params: [{ ...desiredChainIdOrChainParameters, chainId: desiredChainIdHex }],
                  }).catch((addingError: ProviderRpcError) => {
                    this.actions.update({ addingChain: undefined, switchingChain: undefined })
                    throw addingError
                  })
                } else if (this.chainParameters && Object.keys(this.chainParameters).includes(String(desiredChainId))) {
                  this.actions.update({
                    addingChain: {
                      chainId: desiredChainId,
                    },
                  })

                  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                  return this.provider!.request({
                    method: 'wallet_addEthereumChain',
                    params: [{ ...this.chainParameters[desiredChainId], chainId: desiredChainIdHex }],
                  }).catch((addingError: ProviderRpcError) => {
                    this.actions.update({ addingChain: undefined, switchingChain: undefined })
                    throw addingError
                  })
                }
              }

              this.actions.update({ addingChain: undefined, switchingChain: undefined })

              throw switchingError
            })
            .then(() => {
              this.actions.update({ addingChain: undefined, switchingChain: undefined })

              return this.activate(desiredChainId)
            })
        })
      })
      .catch((error) => {
        cancelActivation?.()
        throw error
      })
  }

  public async watchAsset({
    desiredChainIdOrChainParameters,
    address,
    symbol,
    decimals,
    image,
  }: WatchAssetParameters): Promise<true> {
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

        // We need a small delay before calling the next request to the provider or else it won't work.
        await new Promise((resolve) => {
          setTimeout(resolve, 100)
        })
      }
    }
    return this.provider
      .request({
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
