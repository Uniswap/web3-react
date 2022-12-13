import QRCodeModal from '@walletconnect/qrcode-modal'
import type { default as UniversalProvider, UniversalProviderOpts } from '@walletconnect/universal-provider'
import { Actions, Connector } from '@web3-react/types'

type RpcMap = Record<string, string | string[]>

type WalletConnectionOpts = UniversalProviderOpts & {
  rpcMap: RpcMap
}

type WalletConnectConstructorArgs = {
  options: WalletConnectionOpts
  actions: Actions

  onError?: (error: Error) => void
}

export class WalletConnect extends Connector {
  // @ts-expect-error we need to resolve conflicts between EventEmitter types
  public provider?: UniversalProvider
  private lazyProvider?: Promise<UniversalProvider>

  private readonly options: UniversalProviderOpts
  private readonly rpcMap: RpcMap

  constructor({ actions, options, onError }: WalletConnectConstructorArgs) {
    super(actions, onError)

    const { rpcMap, ...rest } = options
    this.options = rest
    this.rpcMap = rpcMap

    console.log(rpcMap)
  }

  // @todo why is this async? what is the benefit of a dynamic import?
  private async getProvider(): Promise<UniversalProvider> {
    if (this.lazyProvider) return this.lazyProvider

    this.lazyProvider = import('@walletconnect/universal-provider').then(async ({ default: UniversalProvider }) => {
      const client = await UniversalProvider.init(this.options)

      client.on('display_uri', (uri: string) => {
        QRCodeModal.open(uri, () => {
          console.log('QR modal closed by the user (no connection)')
        })
      })

      client.on('session_event', ({ event, chainId }: { event: any; chainId: string }) => {
        console.log('EVENT', 'session_event')
        console.log(event, chainId)
      })

      return client
    })

    this.provider = await this.lazyProvider
    
    return this.lazyProvider
    // @todo register events
    // this.provider.on('disconnect', this.disconnectListener)
    // this.provider.on('chainChanged', this.chainChangedListener)
    // this.provider.on('accountsChanged', this.accountsChangedListener)
  }

  // private disconnectListener = (error?: ProviderRpcError): void => {
  //   this.actions.resetState()

  //   // @todo is this correct? listener will not be triggered when error is undefined
  //   if (error) this.onError?.(error)
  // }

  // // @todo type for this is `string`, but WalletConnect code looks like a `number`. To investigate.
  // // https://github.com/WalletConnect/walletconnect-monorepo/blob/v2.0/providers/ethereum-provider/src/index.ts#L193
  // private chainChangedListener = (chainId: number): void => {
  //   this.actions.update({ chainId })
  // }

  // private accountsChangedListener = (accounts: string[]): void => {
  //   this.actions.update({ accounts })
  // }

  public async activate(chainId = 1): Promise<void> {
    const provider = await this.getProvider()

    // this early return clause catches some common cases if activate is called after connection has been established
    // if (provider.session) {
    //   if (!desiredChainId || desiredChainId === this.provider.chainId) return
    //   return this.provider.request<void>({
    //     method: 'wallet_switchEthereumChain',
    //     params: [{ chainId: `0x${desiredChainId.toString(16)}` }],
    //   })
    // }

    const cancelActivation = this.actions.startActivation()

    try {
      // @todo resolve the best URL just like we do for WalletConnect
      const rpcMap = Object.entries(this.rpcMap || {}).reduce((acc, [chainId, rpcUrl]) => {
        acc[chainId] = Array.isArray(rpcUrl) ? rpcUrl[0] : rpcUrl
        return acc
      }, {} as Record<string, string>)

      await provider.connect({
        namespaces: {
          eip155: {
            methods: ['eth_requestAccounts'],
            chains: [`eip155:${chainId}`],
            events: ['chainChanged', 'accountsChanged'],
            rpcMap,
          },
        },
      })

      const accounts = await provider.enable()
      this.actions.update({ chainId, accounts })
    } catch (error) {
      cancelActivation()
      throw error
    } finally {
      QRCodeModal.close()
    }
  }

  // public async connectEagerly(): Promise<void> {
  //   const cancelActivation = this.actions.startActivation()

  //   try {
  //     const provider = await this.getProvider()

  //     const accounts = await provider.enable()
  //     const chainId = await provider.request<number>({ method: 'eth_chainId' })

  //     if (accounts.length === 0) {
  //       throw new Error('No accounts returned')
  //     }

  //     this.actions.update({ chainId, accounts })
  //   } catch (error) {
  //     cancelActivation()
  //     throw error
  //   }
  // }

  public async deactivate(): Promise<void> {
    this.actions.resetState()

    const provider = await this.getProvider()
    await provider.disconnect()

    this.provider = undefined
    this.client = undefined
  }
}
