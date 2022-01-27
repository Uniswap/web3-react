import type { Eip1193Bridge } from '@ethersproject/experimental'
import type { ConnectionInfo } from '@ethersproject/web'
import type { Actions } from '@web3-react/types'
import { Connector } from '@web3-react/types'

type url = string | ConnectionInfo

export class Url extends Connector {
  /** {@inheritdoc Connector.provider} */
  provider: Eip1193Bridge | undefined

  private url: url

  /**
   * @param url - An RPC url.
   * @param connectEagerly - A flag indicating whether connection should be initiated when the class is constructed.
   */
  constructor(actions: Actions, url: url, connectEagerly = true) {
    super(actions)
    this.url = url

    if (connectEagerly) {
      void this.initialize()
    }
  }

  private async initialize(): Promise<void> {
    this.actions.startActivation()

    // create the provider if necessary
    if (!this.provider) {
      // instantiate new provider
      const [JsonRpcProvider, Eip1193Bridge] = await Promise.all([
        import('@ethersproject/providers').then(({ JsonRpcProvider }) => JsonRpcProvider),
        import('@ethersproject/experimental').then(({ Eip1193Bridge }) => Eip1193Bridge),
      ])

      const provider = new JsonRpcProvider(this.url)
      this.provider = new Eip1193Bridge(provider.getSigner(), provider)
    }

    return this.provider
      .request({ method: 'eth_chainId' })
      .then((chainId: number) => {
        this.actions.update({ chainId, accounts: [] })
      })
      .catch((error: Error) => {
        this.actions.reportError(error)
      })
  }

  /** {@inheritdoc Connector.activate} */
  public async activate(): Promise<void> {
    return this.initialize()
  }
}
