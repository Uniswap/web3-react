import type { JsonRpcProvider } from '@ethersproject/providers'
import type { ConnectionInfo } from '@ethersproject/web'
import type { Actions } from '@web3-react/types'
import { Connector } from '@web3-react/types'

type url = string | ConnectionInfo

export class Url extends Connector {
  /** {@inheritdoc Connector.provider} */
  public provider: undefined
  /** {@inheritdoc Connector.customProvider} */
  public customProvider: JsonRpcProvider | undefined

  private eagerConnection?: Promise<void>
  private url: url

  /**
   * @param url - An RPC url.
   * @param connectEagerly - A flag indicating whether connection should be initiated when the class is constructed.
   */
  constructor(actions: Actions, url: url, connectEagerly = false) {
    super(actions)

    if (connectEagerly && typeof window === 'undefined') {
      throw new Error('connectEagerly = true is invalid for SSR, instead use the activate method in a useEffect')
    }

    this.url = url

    if (connectEagerly) void this.activate()
  }

  private async isomorphicInitialize() {
    if (this.eagerConnection) return this.eagerConnection

    await (this.eagerConnection = import('@ethersproject/providers').then(({ JsonRpcProvider }) => {
      this.customProvider = new JsonRpcProvider(this.url)
    }))
  }

  /** {@inheritdoc Connector.activate} */
  public async activate(): Promise<void> {
    if (!this.provider) this.actions.startActivation()

    await this.isomorphicInitialize()

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const { chainId } = this.customProvider!.network
    this.actions.update({ chainId, accounts: [] })
  }
}
