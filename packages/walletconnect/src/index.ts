import type WalletConnectProvider from '@walletconnect/ethereum-provider'
import type { IWCEthRpcConnectionOptions } from '@walletconnect/types'
import type { Actions, ProviderRpcError } from '@web3-react/types'
import { Connector } from '@web3-react/types'
import EventEmitter3 from 'eventemitter3'
import type { EventEmitter } from 'node:events'
import { getBestUrl } from './utils'

export const URI_AVAILABLE = 'URI_AVAILABLE'

type MockWalletConnectProvider = WalletConnectProvider & EventEmitter

function parseChainId(chainId: string | number) {
  return typeof chainId === 'string' ? Number.parseInt(chainId) : chainId
}

type WalletConnectOptions = Omit<IWCEthRpcConnectionOptions, 'rpc' | 'infuraId' | 'chainId'> & {
  rpc: { [chainId: number]: string | string[] }
}

export class WalletConnect extends Connector {
  /** {@inheritdoc Connector.provider} */
  public provider: MockWalletConnectProvider | undefined
  public readonly events = new EventEmitter3()

  private readonly options: Omit<WalletConnectOptions, 'rpc'>
  private readonly rpc: { [chainId: number]: string[] }
  private eagerConnection?: Promise<void>
  private treatModalCloseAsError: boolean

  /**
   * @param options - Options to pass to `@walletconnect/ethereum-provider`
   * @param connectEagerly - A flag indicating whether connection should be initiated when the class is constructed.
   */
  constructor(actions: Actions, options: WalletConnectOptions, connectEagerly = false, treatModalCloseAsError = true) {
    super(actions)

    if (connectEagerly && this.serverSide) {
      throw new Error('connectEagerly = true is invalid for SSR, instead use the connectEagerly method in a useEffect')
    }

    const { rpc, ...rest } = options
    this.rpc = Object.keys(rpc).reduce<{ [chainId: number]: string[] }>((accumulator, chainId) => {
      const value = rpc[Number(chainId)]
      accumulator[Number(chainId)] = Array.isArray(value) ? value : [value]
      return accumulator
    }, {})
    this.options = rest
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

  private URIListener = (_: Error | null, payload: { params: string[] }): void => {
    this.events.emit(URI_AVAILABLE, payload.params[0])
  }

  private async isomorphicInitialize(chainId = Number(Object.keys(this.rpc)[0])): Promise<void> {
    if (this.eagerConnection) return this.eagerConnection

    // because we can only use 1 url per chainId, we need to decide between multiple, where necessary
    const rpc = Promise.all(
      Object.keys(this.rpc).map(
        async (chainId): Promise<[number, string]> => [Number(chainId), await getBestUrl(this.rpc[Number(chainId)])]
      )
    ).then((results) =>
      results.reduce<{ [chainId: number]: string }>((accumulator, [chainId, url]) => {
        accumulator[chainId] = url
        return accumulator
      }, {})
    )

    await (this.eagerConnection = import('@walletconnect/ethereum-provider').then(async (m) => {
      this.provider = new m.default({
        ...this.options,
        chainId,
        rpc: await rpc,
      }) as unknown as MockWalletConnectProvider

      this.provider.on('disconnect', this.disconnectListener)
      this.provider.on('chainChanged', this.chainChangedListener)
      this.provider.on('accountsChanged', this.accountsChangedListener)
      this.provider.connector.on('display_uri', this.URIListener)
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
    } else {
      cancelActivation()
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
    if (desiredChainId && this.rpc[desiredChainId] === undefined) {
      throw new Error(`no url(s) provided for desiredChainId ${desiredChainId}`)
    }

    // this early return clause catches some common cases if we're already connected
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
    ;(this.provider?.connector as unknown as EventEmitter | undefined)?.off('display_uri', this.URIListener)
    await this.provider?.disconnect()
    this.provider = undefined
    this.eagerConnection = undefined
    this.actions.reportError(error)
  }
}
