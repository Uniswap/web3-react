import { Actions, Connector } from '@web3-react/types'
import type {
  LoginWithMagicLinkConfiguration,
  Magic as MagicInstance,
  MagicSDKAdditionalConfiguration,
} from 'magic-sdk'

export interface MagicConnectorArguments extends MagicSDKAdditionalConfiguration {
  apiKey: string
}

export class Magic extends Connector {
  private readonly options: MagicConnectorArguments
  public magic?: MagicInstance

  constructor(actions: Actions, options: MagicConnectorArguments) {
    super(actions)
    this.options = options
  }

  private async startListening(configuration: LoginWithMagicLinkConfiguration): Promise<void> {
    const { apiKey, ...options } = this.options

    return import('magic-sdk')
      .then((m) => m.Magic)
      .then((Magic) => (this.magic = new Magic(apiKey, options)))
      .then(async () => {
        await this.magic!.auth.loginWithMagicLink(configuration)

        const [{ Web3Provider }, { Eip1193Bridge }] = await Promise.all([
          import('@ethersproject/providers'),
          import('@ethersproject/experimental'),
        ])

        const provider = new Web3Provider(this.magic!.rpcProvider as any)

        this.provider = new Eip1193Bridge(provider.getSigner(), provider)
      })
  }

  public async activate(configuration: LoginWithMagicLinkConfiguration): Promise<void> {
    this.actions.startActivation()

    await this.startListening(configuration).catch((error) => {
      this.actions.reportError(error)
    })

    if (this.provider) {
      await Promise.all([
        this.provider.request({ method: 'eth_chainId' }) as Promise<string>,
        this.provider.request({ method: 'eth_accounts' }) as Promise<string[]>,
      ])
        .then(([chainId, accounts]) => {
          this.actions.update({ chainId: Number.parseInt(chainId, 16), accounts })
        })
        .catch((error) => {
          this.actions.reportError(error)
        })
    }
  }
}
