import type { EventEmitter } from 'node:events'

import type WalletConnectProvider from '@walletconnect/ethereum-provider'
import type { Actions, ProviderRpcError } from '@web3-react/types'
import { Connector } from '@web3-react/types'
import EventEmitter3 from 'eventemitter3'

import { getRpcBestUrlMap, orderToSetDefaultChain } from './utils'

export const URI_AVAILABLE = 'URI_AVAILABLE'

type MockWalletConnectProvider = WalletConnectProvider & EventEmitter

/**
 * @param rpcMap - Map of chainIds to rpc url(s). If multiple urls are provided, the first one that responds
 * within a given timeout will be used. Since WalletConnect does not support multiple urls, we will have
 * to resolve the best url before passing it down.
 * @see getRpcBestUrlMap
 */
export type WalletConnectOptions = Omit<Parameters<typeof WalletConnectProvider.init>[0], 'rpcMap'> & {
  rpcMap?: { [chainId: number]: string | string[] }
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

export class WalletConnect extends Connector {
  /** {@inheritdoc Connector.provider} */
  public provider?: MockWalletConnectProvider
  public readonly events = new EventEmitter3()

  private readonly options: Omit<WalletConnectOptions, 'rpcMap' | 'chains'>

  private readonly rpcMap?: Record<number, string | string[]>
  private readonly chains: number[]
  private readonly defaultChainId?: number

  private readonly timeout: number

  private eagerConnection?: Promise<MockWalletConnectProvider>

  constructor({ actions, options, defaultChainId, timeout = 5000, onError }: WalletConnectConstructorArgs) {
    super(actions, onError)

    const { rpcMap, chains, ...rest } = options

    this.options = rest
    this.chains = chains
    this.defaultChainId = defaultChainId
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

  private async isomorphicInitialize(
    desiredChainId: number | undefined = this.defaultChainId
  ): Promise<MockWalletConnectProvider> {
    if (this.eagerConnection) return this.eagerConnection

    const chains = desiredChainId ? orderToSetDefaultChain(this.chains, desiredChainId) : this.chains
    const rpcMap = this.rpcMap ? await getRpcBestUrlMap(this.rpcMap, this.timeout) : undefined

    return (this.eagerConnection = import('@walletconnect/ethereum-provider').then(async (ethProviderModule) => {
      const provider = (this.provider = (await ethProviderModule.default.init({
        ...this.options,
        chains,
        rpcMap,
      })) as unknown as MockWalletConnectProvider)
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

    try {
      const { session, accounts, chainId } = await this.isomorphicInitialize()
      if (!session) {
        throw new Error('No active session found. Connect your wallet first.')
      }
      this.actions.update({ accounts, chainId })
    } catch (error) {
      cancelActivation()
      throw error
    }
  }

  /**
   * @param desiredChainId - The desired chainId to connect to.
   */
  public async activate(desiredChainId?: number): Promise<void> {
    if (this.provider?.session) {
      if (!desiredChainId || desiredChainId === this.provider.chainId) return
      if (!this.chains.includes(desiredChainId)) {
        throw new Error(`Cannot activate chain ${desiredChainId} that provider wasn't initialized with`)
      }
      return this.provider.request<void>({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${desiredChainId.toString(16)}` }],
      })
    }

    const cancelActivation = this.actions.startActivation()

    try {
      const provider = await this.isomorphicInitialize(desiredChainId)
      await provider.enable()
      this.actions.update({ chainId: provider.chainId, accounts: provider.accounts })
    } catch (error) {
      await this.deactivate()
      cancelActivation()
      throw error
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
