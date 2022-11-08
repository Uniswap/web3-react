import { Connector, Actions, ProviderConnectInfo, ProviderRpcError } from '@web3-react/types'
import type { Magic as MagicInstance, MagicSDKAdditionalConfiguration } from 'magic-sdk'
import type { ConnectExtension as ConnectExtensionInstance } from '@magic-ext/connect'

function parseChainId(chainId: string | number) {
  return typeof chainId === 'number' ? chainId : Number.parseInt(chainId, chainId.startsWith('0x') ? 16 : 10)
}

export interface MagicConnectorSDKOptions extends MagicSDKAdditionalConfiguration {
  apiKey: string
  networkOptions: {
    rpcUrl: string
    chainId: number
  }
}
/**
 * @param options - Options to pass to `magic-sdk`.
 * @param onError - Handler to report errors thrown from eventListeners.
 */
export interface MagicConnectConstructorArgs {
  actions: Actions
  options: MagicConnectorSDKOptions
  onError?: (error: Error) => void
}

export class MagicConnect extends Connector {
  private readonly options: MagicConnectorSDKOptions
  public magic?: MagicInstance<ConnectExtensionInstance[]>

  private eagerConnection?: Promise<void>

  constructor({ actions, options, onError }: MagicConnectConstructorArgs) {
    super(actions, onError)
    this.options = options
  }

  private async isomorphicInitialize(): Promise<void> {
    if (this.eagerConnection) return
    const { ConnectExtension } = await import('@magic-ext/connect')
    const { apiKey, networkOptions } = this.options

    await (this.eagerConnection = import('magic-sdk')
      .then((m) => m.Magic)
      .then(
        (Magic) =>
          (this.magic = new Magic(apiKey, {
            extensions: [new ConnectExtension()],
            network: networkOptions,
          }))
      )
      .then(async () => {
        const [{ Web3Provider }, { Eip1193Bridge }] = await Promise.all([
          import('@ethersproject/providers'),
          import('@ethersproject/experimental'),
        ])

        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        const provider = new Web3Provider(this.magic?.rpcProvider as any)
        await provider.listAccounts()

        this.provider = new Eip1193Bridge(provider.getSigner(), provider)

        this.provider.on('connect', ({ chainId }: ProviderConnectInfo): void => {
          this.actions.update({ chainId: parseChainId(chainId) })
        })

        this.provider.on('disconnect', (error: ProviderRpcError): void => {
          this.actions.resetState()
          this.onError?.(error)
        })

        this.provider.on('chainChanged', (chainId: string): void => {
          this.actions.update({ chainId: parseChainId(chainId) })
        })

        this.provider.on('accountsChanged', (accounts: string[]): void => {
          if (accounts.length === 0) {
            // handle this edge case by disconnecting
            this.actions.resetState()
          } else {
            this.actions.update({ accounts })
          }
        })
      }))
  }

  /** {@inheritdoc Connector.connectEagerly} */
  public async connectEagerly(): Promise<void> {
    const cancelActivation = this.actions.startActivation()

    await this.isomorphicInitialize()
    if (!this.provider) throw Error('No existing connection')

    return Promise.all([
      this.provider.request({ method: 'eth_chainId' }) as Promise<string>,
      this.provider.request({ method: 'eth_accounts' }) as Promise<string[]>,
    ])
      .then(([chainId, accounts]) => {
        this.actions.update({ chainId: parseChainId(chainId), accounts })
      })
      .catch((error) => {
        cancelActivation()
        throw error
      })
  }

  public async activate(): Promise<void> {
    const cancelActivation = this.actions.startActivation()
    try {
      await this.isomorphicInitialize()

      if (!this.provider) throw new Error('No existing connection')
      await Promise.all([
        this.provider.request({ method: 'eth_chainId' }) as Promise<string>,
        this.provider.request({ method: 'eth_accounts' }) as Promise<string[]>,
      ])
        .then(([chainId, accounts]) => {
          this.actions.update({ chainId: parseChainId(chainId), accounts })
        })
        .catch((error) => {
          cancelActivation()
          throw error
        })
    } catch (error) {
      cancelActivation()
      throw error
    }
  }
}
