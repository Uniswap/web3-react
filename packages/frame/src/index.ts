import type { Actions, Provider, ProviderConnectInfo, ProviderRpcError } from '@web3-react/types'
import { Connector } from '@web3-react/types'

export class NoFrameError extends Error {
  public constructor() {
    super('Frame not installed')
    this.name = NoFrameError.name
    Object.setPrototypeOf(this, NoFrameError.prototype)
  }
}

function parseChainId(chainId: string) {
  return Number.parseInt(chainId, 16)
}

interface FrameConnectorArguments {
  infuraId?: string
  alchemyId?: string
  origin?: string
}

type FrameProvider = (a: 'frame', b?: FrameConnectorArguments) => Provider

export class Frame extends Connector {
  private readonly options?: FrameConnectorArguments
  private providerPromise?: Promise<void>

  constructor(actions: Actions, options?: FrameConnectorArguments, connectEagerly = true) {
    super(actions)
    this.options = options

    if (connectEagerly) {
      this.providerPromise = this.startListening(connectEagerly)
    }
  }

  private async startListening(connectEagerly: boolean): Promise<void> {
    const ethProvider = await import('eth-provider').then((m: { default: FrameProvider }) => m.default)

    try {
      this.provider = ethProvider('frame', this.options)
    } catch (error) {
      this.actions.reportError(error as Error)
    }

    if (this.provider) {
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
        this.actions.update({ accounts })
      })

      if (connectEagerly) {
        return Promise.all([
          this.provider.request({ method: 'eth_chainId' }) as Promise<string>,
          this.provider.request({ method: 'eth_accounts' }) as Promise<string[]>,
        ])
          .then(([chainId, accounts]) => {
            if (accounts?.length > 0) {
              this.actions.update({ chainId: parseChainId(chainId), accounts })
            }
          })
          .catch((error) => {
            console.debug('Could not connect eagerly', error)
          })
      }
    }
  }

  public async activate(): Promise<void> {
    this.actions.startActivation()

    if (!this.providerPromise) {
      this.providerPromise = this.startListening(false)
    }
    await this.providerPromise

    if (this.provider) {
      await Promise.all([
        this.provider.request({ method: 'eth_chainId' }) as Promise<string>,
        this.provider.request({ method: 'eth_requestAccounts' }) as Promise<string[]>,
      ])
        .then(([chainId, accounts]) => {
          this.actions.update({ chainId: parseChainId(chainId), accounts })
        })
        .catch((error: Error) => {
          this.actions.reportError(error)
        })
    } else {
      this.actions.reportError(new NoFrameError())
    }
  }
}
