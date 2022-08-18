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

/**
 * @param options - Options to pass to `@walletconnect/ethereum-provider`
 * @param defaultChainId - The chainId to connect to in activate if one is not provided.
 * @param timeout - Timeout, in milliseconds, after which to treat network calls to urls as failed when selecting
 * online urls.
 * @param onError - Handler to report errors thrown from eventListeners.
 */
export interface WalletConnectConstructorArgs {
  actions: Actions
  options: WalletConnectOptions
  defaultChainId?: number
  timeout?: number
  onError?: (error: Error) => void
}

/**
 * @param desiredChainId - The desired chainId to connect to.
 * @param preventUserPrompt - If true, will suppress user-facing interactions and only connect silently.
 */
export interface ActivateOptions {
  desiredChainId?: number
  onlyIfAlreadyConnected?: boolean
}

export class WalletConnect extends Connector {
  /** {@inheritdoc Connector.provider} */
  public provider?: MockWalletConnectProvider
  public readonly events = new EventEmitter3()

  private readonly options: Omit<WalletConnectOptions, 'rpc'>
  private readonly rpc: { [chainId: number]: string[] }
  private readonly defaultChainId: number
  private readonly timeout: number

  private eagerConnection?: Promise<void>

  constructor({ actions, options, defaultChainId, timeout = 5000, onError }: WalletConnectConstructorArgs) {
    super(actions, onError)

    const { rpc, ...rest } = options
    this.options = rest
    this.rpc = Object.keys(rpc).reduce<{ [chainId: number]: string[] }>((accumulator, chainId) => {
      const value = rpc[Number(chainId)]
      accumulator[Number(chainId)] = Array.isArray(value) ? value : [value]
      return accumulator
    }, {})
    this.defaultChainId = defaultChainId ?? Number(Object.keys(this.rpc)[0])
    this.timeout = timeout
  }

  private disconnectListener = (error?: ProviderRpcError): void => {
    this.actions.resetState()
    if (error) this.onError?.(error)
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

  private async isomorphicInitialize(chainId = this.defaultChainId): Promise<void> {
    if (this.eagerConnection) return

    // because we can only use 1 url per chainId, we need to decide between multiple, where necessary
    const rpc = Promise.all(
      Object.keys(this.rpc).map(
        async (chainId): Promise<[number, string]> => [
          Number(chainId),
          await getBestUrl(this.rpc[Number(chainId)], this.timeout),
        ]
      )
    ).then((results) =>
      results.reduce<{ [chainId: number]: string }>((accumulator, [chainId, url]) => {
        accumulator[chainId] = url
        return accumulator
      }, {})
    )

    return (this.eagerConnection = import('@walletconnect/ethereum-provider').then(async (m) => {
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

    try {
      await this.isomorphicInitialize()
      if (!this.provider?.connected) throw Error('No existing connection')

      // for walletconnect, we always use sequential instead of parallel fetches because otherwise
      // chainId defaults to 1 even if the connecting wallet isn't on mainnet
      const accounts = await this.provider?.request<string[]>({ method: 'eth_accounts' })
      if (!accounts.length) throw new Error('No accounts returned')
      const chainId = await this.provider
        .request<string | number>({ method: 'eth_chainId' })
        .then((chainId) => parseChainId(chainId))

      this.actions.update({ chainId, accounts })
    } catch (error) {
      cancelActivation()
      throw error
    }
  }

  /**
   * @param desiredChainId - The desired chainId to connect to.
   */
  public async activate(desiredChainId?: number): Promise<void> {
    // this early return clause catches some common cases if activate is called after connection has been established
    if (this.provider?.connected) {
      if (!desiredChainId || desiredChainId === this.provider.chainId) return
      // beacuse the provider is already connected, we can ignore the suppressUserPrompts
      return this.provider.request<void>({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${desiredChainId.toString(16)}` }],
      })
    }

    const cancelActivation = this.actions.startActivation()

    // if we're trying to connect to a specific chain that we're not already initialized for, we have to re-initialize
    if (desiredChainId && desiredChainId !== this.provider?.chainId) await this.deactivate()

    try {
      await this.isomorphicInitialize(desiredChainId)

      const accounts = await this.provider
        ?.request<string[]>({ method: 'eth_requestAccounts' })
        // if a user triggers the walletconnect modal, closes it, and then tries to connect again,
        // the modal will not trigger. by deactivating when this happens, we prevent the bug.
        .catch(async (error: Error) => {
          if (error?.message === 'User closed modal') await this.deactivate()
          throw error
        })

      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const chainId = await this.provider!.request<string | number>({ method: 'eth_chainId' }).then((chainId) =>
        parseChainId(chainId)
      )

      this.actions.update({ chainId, accounts })
    } catch (error) {
      cancelActivation()
      throw error
    }
  }

  /** {@inheritdoc Connector.deactivate} */
  public async deactivate(): Promise<void> {
    this.provider?.off('disconnect', this.disconnectListener)
    this.provider?.off('chainChanged', this.chainChangedListener)
    this.provider?.off('accountsChanged', this.accountsChangedListener)
    // we don't unregister the display_uri handler because the walletconnect types/inheritances are really broken.
    // it doesn't matter, anyway, as the connector object is destroyed
    await this.provider?.disconnect()
    this.provider = undefined
    this.eagerConnection = undefined
    this.actions.resetState()
  }
}
