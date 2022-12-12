import SignClient from "@walletconnect/sign-client";
import { SignClientTypes } from '@walletconnect/types'
import QRCodeModal from "@walletconnect/qrcode-modal"
import { Actions, Connector } from '@web3-react/types'

type WalletConnectConstructorArgs = {
  options: SignClientTypes.Options,
  actions: Actions

  onError?: (error: Error) => void
}

export class WalletConnect extends Connector {
  // @ts-expect-error we need to resolve conflicts between EventEmitter types
  public provider?: SignClient

  private readonly options: SignClientTypes.Options

  constructor({ actions, options, onError }: WalletConnectConstructorArgs) {
    super(actions, onError)

    this.options = options
  }

  private async isomorphicInitialize(): Promise<SignClient> {
    if (this.provider) return this.provider

    return (this.provider = await import('@walletconnect/sign-client').then(async ({ default: SignClient }) => {
      return await SignClient.init(this.options)
    }))

    // @todo register events
    // this.provider.on('disconnect', this.disconnectListener)
    // this.provider.on('chainChanged', this.chainChangedListener)
    // this.provider.on('accountsChanged', this.accountsChangedListener)

    // this.provider.connector.on('display_uri', this.URIListener)
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

  public async activate(): Promise<void> {
    // this early return clause catches some common cases if activate is called after connection has been established
    // if (this.provider?.core.relayer.connected) {
    //   if (!desiredChainId || desiredChainId === this.provider.chainId) return
    //   return this.provider.request<void>({
    //     method: 'wallet_switchEthereumChain',
    //     params: [{ chainId: `0x${desiredChainId.toString(16)}` }],
    //   })
    // }

    const cancelActivation = this.actions.startActivation()

    try {
      const provider = await this.isomorphicInitialize()

      const { uri, approval } = await provider.connect({
        requiredNamespaces: {
          eip155: {
            methods: [
              "eth_requestAccounts",
            ],
            chains: ["eip155:1"],
            events: ["chainChanged", "accountsChanged"],
          },
        },
      });

      if (uri) {
        QRCodeModal.open(uri, () => {
          console.log("EVENT", "QR Code Modal closed");
        });
      }
      
      await approval()
    } catch (error) {
      cancelActivation()
      throw error
    }
  }

  public async deactivate(): Promise<void> {
    // this.eagerConnection = undefined
    // this.actions.resetState()

    // if (this.provider) {
    //   this.provider.off('disconnect', this.disconnectListener)
    //   this.provider.off('chainChanged', this.chainChangedListener)
    //   this.provider.off('accountsChanged', this.accountsChangedListener)
      
    //   await this.provider.disconnect()
    //   this.provider = undefined
    // }
  }
}
