import type WalletConnectProvider from '@walletconnect/ethereum-provider'
import type { Actions, ProviderRpcError } from '@web3-react/types'
import { Connector } from '@web3-react/types'
import EventEmitter3 from 'eventemitter3'
import type { EventEmitter } from 'node:events'
import { getBestUrl } from './utils'

export const URI_AVAILABLE = 'URI_AVAILABLE'

type MockWalletConnectProvider = WalletConnectProvider & EventEmitter

// @todo document why `rpcMap` type is changed
type WalletConnectOptions = Omit<Parameters<typeof WalletConnectProvider.init>[0], 'rpcMap'> & {
  rpcMap?: { [chainId: number]: string | string[] }
}

/**
 * @param options - Options to pass to `@walletconnect/ethereum-provider`
 * @param timeout - Timeout, in milliseconds, after which to treat network calls to urls as failed when selecting
 * online urls.
 * @param onError - Handler to report errors thrown from eventListeners.
 */
export interface WalletConnectConstructorArgs {
  actions: Actions
  options: WalletConnectOptions
  timeout?: number
  onError?: (error: Error) => void
}

export class WalletConnect extends Connector {
  /** {@inheritdoc Connector.provider} */
  public provider?: MockWalletConnectProvider
  public readonly events = new EventEmitter3()

  private readonly options: Omit<WalletConnectOptions, 'rpc'>

  private readonly rpcMap?: Record<number, string | string[]>

  private readonly timeout: number

  private eagerConnection?: Promise<MockWalletConnectProvider>

  constructor({ actions, options, timeout = 5000, onError }: WalletConnectConstructorArgs) {
    super(actions, onError)

    const { rpcMap, ...rest } = options

    this.options = rest
    this.rpcMap = rpcMap
    this.timeout = timeout
  }

  private disconnectListener = (error?: ProviderRpcError): void => {
    this.actions.resetState()
    if (error) this.onError?.(error)
  }

  private chainChangedListener = (chainId: number): void => {
    this.actions.update({ chainId })
  }

  private accountsChangedListener = (accounts: string[]): void => {
    this.actions.update({ accounts })
  }

  private URIListener = (uri: string): void => {
    this.events.emit(URI_AVAILABLE, uri)
  }

  private async isomorphicInitialize(): Promise<MockWalletConnectProvider> {
    if (this.eagerConnection) return this.eagerConnection

    if (this.provider) {
      await this.deactivate()
    }
    
    const rpcMap = this.rpcMap
    const resolvedRpcMap = rpcMap ? Object.fromEntries(
      await Promise.all(
        Object.entries(rpcMap).map(
          async ([chainId, map]): Promise<[string, string]> => [
            `${chainId}`,
            await getBestUrl(map, this.timeout),
          ]
        )
      )
    ) : undefined
    
    return (this.eagerConnection = import('@walletconnect/ethereum-provider').then(async (m) => {
      const provider = this.provider = await m.default.init({
        ...this.options,
        rpcMap: resolvedRpcMap,
      }) as unknown as MockWalletConnectProvider

      provider.on('disconnect', this.disconnectListener)
      provider.on('chainChanged', this.chainChangedListener)
      provider.on('accountsChanged', this.accountsChangedListener)
      provider.on('display_uri', this.URIListener)
      
      return provider
    }))
  }

  /** {@inheritdoc Connector.connectEagerly} */
  public async connectEagerly(): Promise<void> {
    const cancelActivation = this.actions.startActivation()

    /**
     * WalletConnect automatically restores the session on `init` and updates the `accounts` and `chainId` properties.
     * Therefore, it is not neccessary to call `eth_accounts` and `eth_chainId` to get the accounts and chainId.
     */
    try {
      const provider = await this.isomorphicInitialize()
      if (!provider.accounts.length) {
        throw new Error('No accounts returned')
      }
      this.actions.update({ accounts: provider.accounts, chainId: provider.chainId })
    } finally {
      cancelActivation()
    }
  }

  /**
   * @param desiredChainId - The desired chainId to connect to.
   */
  public async activate(desiredChainId?: number): Promise<void> {
    // If we are already have an established session, we should switch chains instead
    if (this.provider?.session) {
      if (!desiredChainId || desiredChainId === this.provider.chainId) return
      if (!this.options.chains.includes(desiredChainId)) {
        throw new Error(`No rpc configuration for chain ${desiredChainId}`)
      }
      return this.provider.request<void>({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${desiredChainId.toString(16)}` }],
      })
    }

    const cancelActivation = this.actions.startActivation()

    try {
      // @todo we need to provide a way to initialise with a given chain. waiting for an update
      // whether `desiredChainId` is first item in `chains` array 
      const provider = await this.isomorphicInitialize()

      await provider.enable()

      // if a user triggers the walletconnect modal, closes it, and then tries to connect again,
      // the modal will not trigger. by deactivating when this happens, we prevent the bug.
      //
      // @todo `provider.enable` no longer throws an error when the user closes the modal.
      // Find a better way.
      //
      // .catch(async (error: Error) => {
      //   if (error?.message === 'User closed modal') await this.deactivate()
      //   throw error
      // })
      this.actions.update({ chainId: provider.chainId, accounts: provider.accounts })
    } finally {
      cancelActivation()
    }
  }

  /** {@inheritdoc Connector.deactivate} */
  public async deactivate(): Promise<void> {
    this.provider?.off('disconnect', this.disconnectListener)
    this.provider?.off('chainChanged', this.chainChangedListener)
    this.provider?.off('accountsChanged', this.accountsChangedListener)
    this.provider?.off('display_uri', this.URIListener)
    await this.provider?.disconnect()
    this.provider = undefined
    this.eagerConnection = undefined
    this.actions.resetState()
  }
}
