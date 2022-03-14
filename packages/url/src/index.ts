import type { Eip1193Bridge } from '@ethersproject/experimental'
import type { ConnectionInfo } from '@ethersproject/web'
import type { Actions } from '@web3-react/types'
import { Connector } from '@web3-react/types'

type url = string | ConnectionInfo

function parseChainId(chainId: string) {
  return Number.parseInt(chainId, 16)
}

export class Url extends Connector {
  /** {@inheritdoc Connector.provider} */
  public provider: Eip1193Bridge | undefined

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

    await (this.eagerConnection = Promise.all([
      import('@ethersproject/providers').then(({ JsonRpcProvider }) => JsonRpcProvider),
      import('@ethersproject/experimental').then(({ Eip1193Bridge }) => Eip1193Bridge),
    ]).then(([JsonRpcProvider, Eip1193Bridge]) => {
      const provider = new JsonRpcProvider(this.url)
      this.provider = new Eip1193Bridge(provider.getSigner(), provider)
    }))
  }

  /** {@inheritdoc Connector.activate} */
  public async activate(): Promise<void> {
    if (!this.provider) this.actions.startActivation()

    await this.isomorphicInitialize()

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return this.provider!.request({ method: 'eth_chainId' })
      .then((chainId: string) => {
        this.actions.update({ chainId: parseChainId(chainId), accounts: [] })
      })
      .catch((error: Error) => {
        this.actions.reportError(error)
      })
  }
}
