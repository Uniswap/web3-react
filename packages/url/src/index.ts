import type { JsonRpcProvider } from '@ethersproject/providers'
import type { ConnectionInfo } from '@ethersproject/web'
import type { Actions } from '@web3-react/types'
import { Connector } from '@web3-react/types'

type url = string | ConnectionInfo

function isUrl(url: url | JsonRpcProvider): url is url {
  return typeof url === 'string' || ('url' in url && !('connection' in url))
}

export class Url extends Connector {
  /** {@inheritdoc Connector.provider} */
  public readonly provider: undefined
  /** {@inheritdoc Connector.customProvider} */
  public customProvider: JsonRpcProvider | undefined

  private eagerConnection?: Promise<JsonRpcProvider>
  private readonly url: url | JsonRpcProvider

  /**
   * @param url - An RPC url or a JsonRpcProvider.
   * @param connectEagerly - A flag indicating whether connection should be initiated when the class is constructed.
   */
  constructor(actions: Actions, url: url | JsonRpcProvider, connectEagerly = false) {
    super(actions)

    if (connectEagerly && typeof window === 'undefined') {
      throw new Error('connectEagerly = true is invalid for SSR, instead use the activate method in a useEffect')
    }

    this.url = url

    if (connectEagerly) void this.activate()
  }

  private async isomorphicInitialize() {
    if (this.eagerConnection) return this.eagerConnection

    if (!isUrl(this.url)) return this.url

    return (this.eagerConnection = import('@ethersproject/providers').then(({ JsonRpcProvider }) => {
      return new JsonRpcProvider(this.url as url)
    }))
  }

  /** {@inheritdoc Connector.activate} */
  public async activate(): Promise<void> {
    if (!this.customProvider) this.actions.startActivation()

    await this.isomorphicInitialize()
      .then(async (customProvider) => {
        this.customProvider = customProvider

        const { chainId } = await this.customProvider.getNetwork()
        this.actions.update({ chainId, accounts: [] })
      })
      .catch((error: Error) => {
        this.actions.reportError(error)
      })
  }
}
