import type WalletConnectProvider from '@walletconnect/ethereum-provider'
import { EthereumProviderOptions, EthereumRpcMap } from '@walletconnect/ethereum-provider'
import { ProviderRpcError, Actions, Connector } from '@web3-react/types'

type WalletConnectOptions = Omit<EthereumProviderOptions, 'rpcMap'> & {
  rpcMap?: Record<string, string | string[]>
}

type WalletConnectConstructorArgs = {
  options: WalletConnectOptions,
  actions: Actions

  onError?: (error: Error) => void
}

export class WalletConnect extends Connector {
  public provider?: WalletConnectProvider

  private readonly options: WalletConnectOptions

  private eagerConnection?: Promise<void>

  constructor({ actions, options, onError }: WalletConnectConstructorArgs) {
    super(actions, onError)

    this.options = options
  }

  private async isomorphicInitialize(chainId = this.options.chainId): Promise<void> {
    if (this.eagerConnection) return

    return (this.eagerConnection = import('@walletconnect/ethereum-provider').then(({ default: EthereumProvider }) => {
      
      // @todo we should actually choose the best URL here
      const rpcMap: EthereumRpcMap = {}
      for(const [chainId, urls] of Object.entries(this.options.rpcMap || {})) {
        rpcMap[chainId] = Array.isArray(urls) ? urls[0] : urls
      }

      this.provider = new EthereumProvider({
        ...this.options,
        chainId,
        rpcMap,
      })

      this.provider.on('disconnect', this.disconnectListener)
      this.provider.on('chainChanged', this.chainChangedListener)
      this.provider.on('accountsChanged', this.accountsChangedListener)

      // this.provider.connector.on('display_uri', this.URIListener)
    }))
  }

  private disconnectListener = (error?: ProviderRpcError): void => {
    this.actions.resetState()

    // @todo is this correct? listener will not be triggered when error is undefined
    if (error) this.onError?.(error)
  }

  // @todo type for this is `string`, but WalletConnect code looks like a `number`. To investigate.
  // https://github.com/WalletConnect/walletconnect-monorepo/blob/v2.0/providers/ethereum-provider/src/index.ts#L193
  private chainChangedListener = (chainId: number): void => {
    this.actions.update({ chainId })
  }

  private accountsChangedListener = (accounts: string[]): void => {
    this.actions.update({ accounts })
  }

  public async activate(desiredChainId?: number): Promise<void> {
    // this early return clause catches some common cases if activate is called after connection has been established
    if (this.provider?.connected) {
      if (!desiredChainId || desiredChainId === this.provider.chainId) return
      return this.provider.request<void>({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${desiredChainId.toString(16)}` }],
      })
    }

    const cancelActivation = this.actions.startActivation()

    try {
      await this.isomorphicInitialize(desiredChainId)

      await this.provider
        ?.request<string[]>({ method: 'eth_requestAccounts' })
        // if a user triggers the walletconnect modal, closes it, and then tries to connect again,
        // the modal will not trigger. by deactivating when this happens, we prevent the bug.
        .catch(async (error: Error) => {
          // @todo we shouldn't decative on a closed modal - there might be another connection already
          if (error?.message === 'User closed modal') await this.deactivate()
          throw error
        })
    } catch (error) {
      cancelActivation()
      throw error
    }
  }

  public async deactivate(): Promise<void> {
    this.eagerConnection = undefined
    this.actions.resetState()

    if (this.provider) {
      this.provider.off('disconnect', this.disconnectListener)
      this.provider.off('chainChanged', this.chainChangedListener)
      this.provider.off('accountsChanged', this.accountsChangedListener)
      
      await this.provider.disconnect()
      this.provider = undefined
    }
  }
}
