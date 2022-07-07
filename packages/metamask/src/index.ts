import type detectEthereumProvider from '@metamask/detect-provider'
import type {
  Actions,
  AddEthereumChainParameter,
  Provider,
  ProviderConnectInfo,
  ProviderRpcError,
  WatchAssetParameters,
} from '@web3-react/types'
import { Connector } from '@web3-react/types'

type MetaMaskProvider = Provider & { isMetaMask?: boolean; isConnected?: () => boolean; providers?: MetaMaskProvider[] }

export class NoMetaMaskError extends Error {
  public constructor() {
    super('MetaMask not installed')
    this.name = NoMetaMaskError.name
    Object.setPrototypeOf(this, NoMetaMaskError.prototype)
  }
}

function parseChainId(chainId: string) {
  return Number.parseInt(chainId, 16)
}

export class MetaMask extends Connector {
  /** {@inheritdoc Connector.provider} */
  public provider: MetaMaskProvider | undefined

  private readonly options?: Parameters<typeof detectEthereumProvider>[0]
  private eagerConnection?: Promise<void>

  /**
   * @param connectEagerly - A flag indicating whether connection should be initiated when the class is constructed.
   * @param options - Options to pass to `@metamask/detect-provider`
   */
  constructor(actions: Actions, connectEagerly = false, options?: Parameters<typeof detectEthereumProvider>[0]) {
    super(actions)

    if (connectEagerly && this.serverSide) {
      throw new Error('connectEagerly = true is invalid for SSR, instead use the connectEagerly method in a useEffect')
    }

    this.options = options

    if (connectEagerly) void this.connectEagerly()
  }

  private async isomorphicInitialize(): Promise<void> {
    if (this.eagerConnection) return this.eagerConnection

    await (this.eagerConnection = import('@metamask/detect-provider')
      .then((m) => m.default(this.options))
      .then((provider) => {
        if (provider) {
          this.provider = provider as MetaMaskProvider

          // edge case if e.g. metamask and coinbase wallet are both installed
          if (this.provider.providers?.length) {
            this.provider = this.provider.providers.find((p) => p.isMetaMask) ?? this.provider.providers[0]
          }

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
            if (accounts.length === 0) {
              // handle this edge case by disconnecting
              this.actions.reportError(undefined)
            } else {
              this.actions.update({ accounts })
            }
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
  }

  /**
   * Initiates a connection.
   *
   * @param desiredChainIdOrChainParameters - If defined, indicates the desired chain to connect to. If the user is
   * already connected to this chain, no additional steps will be taken. Otherwise, the user will be prompted to switch
   * to the chain, if one of two conditions is met: either they already have it added in their extension, or the
   * argument is of type AddEthereumChainParameter, in which case the user will be prompted to add the chain with the
   * specified parameters first, before being prompted to switch.
   */
  public async activate(desiredChainIdOrChainParameters?: number | AddEthereumChainParameter): Promise<void> {
    if (!this.provider?.isConnected?.()) this.actions.startActivation()

    await this.isomorphicInitialize()
    if (!this.provider) return this.actions.reportError(new NoMetaMaskError())

    return Promise.all([
      this.provider.request({ method: 'eth_chainId' }) as Promise<string>,
      this.provider.request({ method: 'eth_requestAccounts' }) as Promise<string[]>,
    ])
      .then(([chainId, accounts]) => {
        const receivedChainId = parseChainId(chainId)
        const desiredChainId =
          typeof desiredChainIdOrChainParameters === 'number'
            ? desiredChainIdOrChainParameters
            : desiredChainIdOrChainParameters?.chainId

        // if there's no desired chain, or it's equal to the received, update
        if (!desiredChainId || receivedChainId === desiredChainId)
          return this.actions.update({ chainId: receivedChainId, accounts })

        const desiredChainIdHex = `0x${desiredChainId.toString(16)}`

        // if we're here, we can try to switch networks
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        return this.provider!.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: desiredChainIdHex }],
        })
          .catch((error: ProviderRpcError) => {
            if (error.code === 4902 && typeof desiredChainIdOrChainParameters !== 'number') {
              // if we're here, we can try to add a new network
              // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
              return this.provider!.request({
                method: 'wallet_addEthereumChain',
                params: [{ ...desiredChainIdOrChainParameters, chainId: desiredChainIdHex }],
              })
            } else {
              throw error
            }
          })
          .then(() => this.activate(desiredChainId))
      })
      .catch((error: ProviderRpcError) => {
        this.actions.reportError(error)
      })
  }

  public async watchAsset({ address, symbol, decimals, image }: WatchAssetParameters): Promise<true> {
    if (!this.provider) throw new Error('No provider')

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
      .then((success) => {
        if (!success) throw new Error('Rejected')
        return true
      })
  }
}
