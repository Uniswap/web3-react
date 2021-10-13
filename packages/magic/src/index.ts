import { Connector, Actions } from '@web3-react/types'
import type { Magic as MagicInstance, MagicSDKAdditionalConfiguration } from 'magic-sdk'

function parseChainId(chainId: string) {
  return Number.parseInt(chainId, 16)
}

export interface MagicConnectorArguments extends MagicSDKAdditionalConfiguration {
  apiKey: string
}

export class Magic extends Connector {
  private readonly options: MagicConnectorArguments
  public magic?: MagicInstance
  private _email: string = ''

  constructor(actions: Actions, options: MagicConnectorArguments) {
    super(actions)
    this.options = options
  }

  get email() {
    return this._email
  }

  set email(email: string) {
    this._email = email
  }

  private async startListening(): Promise<void> {
    const { apiKey, ...options } = this.options

    return import('magic-sdk')
      .then((m) => m.Magic)
      .then((Magic) => (this.magic = new Magic(apiKey, options)))
      .then(async () => {
        await this.magic!.auth.loginWithMagicLink({ email: this.email })

        const [{ Web3Provider }, { Eip1193Bridge }] = await Promise.all([
          import('@ethersproject/providers'),
          import('@ethersproject/experimental'),
        ])

        const provider = new Web3Provider(this.magic!.rpcProvider as any)

        this.provider = new Eip1193Bridge(provider.getSigner(), provider)
      })
  }

  public async activate(): Promise<void> {
    this.actions.startActivation()

    await this.startListening().catch((error) => {
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
