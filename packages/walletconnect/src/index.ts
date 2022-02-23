import type WalletConnectProvider from '@walletconnect/ethereum-provider'
import type { IWCEthRpcConnectionOptions } from '@walletconnect/types'
import type { Actions, ProviderRpcError } from '@web3-react/types'
import { Connector } from '@web3-react/types'
import type { EventEmitter } from 'node:events'

interface MockWalletConnectProvider
  extends Omit<WalletConnectProvider, 'on' | 'off' | 'once' | 'removeListener'>,
    EventEmitter {}

function parseChainId(chainId: string | number) {
  return typeof chainId === 'string' ? Number.parseInt(chainId) : chainId
}

export class WalletConnect extends Connector {
  /** {@inheritdoc Connector.provider} */
  public provider: MockWalletConnectProvider | undefined

  private readonly options?: IWCEthRpcConnectionOptions
  private eagerConnection?: Promise<void>
  private treatModalCloseAsError: boolean

  /**
   * @param options - Options to pass to `@walletconnect/ethereum-provider`
   * @param connectEagerly - A flag indicating whether connection should be initiated when the class is constructed.
   */
  constructor(
    actions: Actions,
    options: IWCEthRpcConnectionOptions,
    connectEagerly = false,
    treatModalCloseAsError = true
  ) {
    super(actions)

    if (connectEagerly && typeof window === 'undefined') {
      throw new Error('connectEagerly = true is invalid for SSR, instead use the connectEagerly method in a useEffect')
    }

    this.options = options
    this.treatModalCloseAsError = treatModalCloseAsError

    if (connectEagerly) void this.connectEagerly()
  }

  private disconnectListener = (error: ProviderRpcError | undefined): void => {
    this.actions.reportError(error)
  }

  private chainChangedListener = (chainId: number | string): void => {
    this.actions.update({ chainId: parseChainId(chainId) })
  }

  private accountsChangedListener = (accounts: string[]): void => {
    this.actions.update({ accounts })
  }

  private async isomorphicInitialize(chainId?: number): Promise<void> {
    if (this.eagerConnection) return this.eagerConnection

    await (this.eagerConnection = import('@walletconnect/ethereum-provider').then((m) => {
      this.provider = new m.default({
        ...this.options,
        ...(chainId ? { chainId } : undefined),
      }) as unknown as MockWalletConnectProvider

      this.provider.on('disconnect', this.disconnectListener)
      this.provider.on('chainChanged', this.chainChangedListener)
      this.provider.on('accountsChanged', this.accountsChangedListener)
    }))
  }

  /** {@inheritdoc Connector.connectEagerly} */
  public async connectEagerly(): Promise<void> {
    const cancelActivation = this.actions.startActivation()

    await this.isomorphicInitialize()

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    if (this.provider!.connected) {
      try {
        // for walletconnect, we always use sequential instead of parallel fetches because otherwise
        // chainId defaults to 1 even if the connecting wallet isn't on mainnet
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const accounts = await this.provider!.request<string[]>({ method: 'eth_accounts' })
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const chainId = parseChainId(await this.provider!.request<string | number>({ method: 'eth_chainId' }))

        if (accounts.length) {
          this.actions.update({ chainId, accounts })
        } else {
          throw new Error('No accounts returned')
        }
      } catch (error) {
        console.debug('Could not connect eagerly', error)
        cancelActivation()
      }
    }
  }

  /**
   * Initiates a connection.
   *
   * @param desiredChainId - If defined, indicates the desired chain to connect to. If the user is
   * already connected to this chain, no additional steps will be taken. Otherwise, the user will be prompted to switch
   * to the chain, if their wallet supports it.
   */
  public async activate(desiredChainId?: number): Promise<void> {
    // this early return clause handles all cases if we're already connected
    if (this.provider?.connected) {
      if (!desiredChainId || desiredChainId === this.provider.chainId) return

      const desiredChainIdHex = `0x${desiredChainId.toString(16)}`
      return this.provider
        .request<void>({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: desiredChainIdHex }],
        })
        .catch(() => void 0)
    }

    this.actions.startActivation()

    // if we're trying to connect to a specific chain that we're not already initialized for, we have to re-initialize
    if (desiredChainId && desiredChainId !== this.provider?.chainId) await this.deactivate()
    await this.isomorphicInitialize(desiredChainId)

    try {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const accounts = await this.provider!.request<string[]>({ method: 'eth_requestAccounts' })
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const chainId = parseChainId(await this.provider!.request<string | number>({ method: 'eth_chainId' }))

      if (!desiredChainId || desiredChainId === chainId) {
        return this.actions.update({ chainId, accounts })
      }

      // because e.g. metamask doesn't support wallet_switchEthereumChain, we have to report connections,
      // even if the chainId isn't necessarily the desired one. this is ok because in e.g. rainbow,
      // we won't report a connection to the wrong chain while the switch is pending because of the re-initialization
      // logic above, which ensures first-time connections are to the correct chain in the first place
      this.actions.update({ chainId, accounts })

      // if we're here, we can try to switch networks, ignoring errors
      const desiredChainIdHex = `0x${desiredChainId.toString(16)}`
      return this.provider
        ?.request<void>({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: desiredChainIdHex }],
        })
        .catch(() => void 0)
    } catch (error) {
      // this condition is a bit of a hack :/
      // if a user triggers the walletconnect modal, closes it, and then tries to connect again,
      // the modal will not trigger. the logic below prevents this from happening
      if ((error as Error).message === 'User closed modal') {
        await this.deactivate(this.treatModalCloseAsError ? (error as Error) : undefined)
      } else {
        this.actions.reportError(error as Error)
      }
    }
  }

  /** {@inheritdoc Connector.deactivate} */
  public async deactivate(error?: Error): Promise<void> {
    this.provider?.off('disconnect', this.disconnectListener)
    this.provider?.off('chainChanged', this.chainChangedListener)
    this.provider?.off('accountsChanged', this.accountsChangedListener)
    await this.provider?.disconnect()
    this.provider = undefined
    this.eagerConnection = undefined
    this.actions.reportError(error)
  }
}
