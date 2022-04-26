import Torus from '@toruslabs/torus-embed/dist/types/embed'
import { TorusParams } from '@toruslabs/torus-embed'
import type { Actions, Provider, ProviderConnectInfo, ProviderRpcError } from '@web3-react/types'
import { Connector } from '@web3-react/types'
interface TorusConnectorArguments {
  chainId: number
  initOptions?: TorusParams
  constructorOptions?: TorusCtorArgs
  loginOptions?: any
}
interface TorusCtorArgs {
  buttonPosition?: 'top-left' | 'top-right' | 'bottom-right' | 'bottom-left'
}

export class TorusConnector extends Connector {
  /** {@inheritdoc Connector.provider} */
  public provider: Provider | undefined
  private readonly chainId: number
  private readonly initOptions: TorusParams
  private readonly constructorOptions: TorusCtorArgs
  private eagerConnection?: Promise<void>

  public torus: Torus | undefined

  constructor(
    actions: Actions,
    { chainId = 137, constructorOptions = {}, initOptions = {} }: TorusConnectorArguments,
    connectEagerly = false
  ) {
    super(actions)

    this.chainId = chainId
    this.constructorOptions = constructorOptions
    this.initOptions = initOptions
    if (connectEagerly && typeof window === 'undefined') {
      throw new Error('connectEagerly = true is invalid for SSR, instead use the connectEagerly method in a useEffect')
    }
    if (connectEagerly) void this.connectEagerly()
  }
  // the `connected` property, is bugged, but this works as a hack to check connection status
  public async activate(initOptions?: TorusParams): Promise<void> {
    this.actions.startActivation()
    if (!this.provider) {
      const Torus = await import('@toruslabs/torus-embed').then((m) => m?.default ?? m)
      this.torus = new Torus(this.constructorOptions)
      initOptions ? await this.torus.init(initOptions) : await this.torus.init()
      await this.torus.ethereum.enable()
      this.provider = this.torus.ethereum
    }

    return Promise.all([
      this.provider.request({ method: 'eth_chainId' }) as Promise<string>,
      this.provider.request({ method: 'eth_accounts' }) as Promise<string[]>,
    ])
      .then(([chainId, accounts]) => {
        if (accounts.length) {
          if (typeof chainId === 'number' || typeof chainId === 'string')
            this.actions.update({ chainId: parseChainId(chainId), accounts })
          else this.actions.update({ chainId: parseChainId(this.chainId), accounts })
        } else {
          this.actions.reportError(new Error('No accounts returned'))
        }
      })
      .catch((error) => {
        console.debug('Could not connect eagerly', error)
        this.actions.startActivation()
      })
  }

  private async isomorphicInitialize(): Promise<void> {
    if (this.eagerConnection) return this.eagerConnection

    await (this.eagerConnection = import('@toruslabs/torus-embed')
      .then((m) => m?.default ?? m)
      .then(async (provider) => {
        if (provider) {
          const newTorus = new provider()
          await newTorus.init()
          await newTorus.ethereum.enable()
          this.provider = newTorus.ethereum
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
          return
        } else {
          throw new Error('No accounts returned')
        }
      })
      .catch((error) => {
        console.debug('Could not connect eagerly', error)
        cancelActivation()
        return
      })
  }
}

function parseChainId(chainId: string | number) {
  return typeof chainId === 'number' ? chainId : Number.parseInt(chainId, chainId.startsWith('0x') ? 16 : 10)
}
