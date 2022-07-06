import type { JsonRpcProvider } from '@ethersproject/providers'
import type { ConnectionInfo } from '@ethersproject/web'
import type { Actions } from '@web3-react/types'
import { Connector } from '@web3-react/types'

type url = string | ConnectionInfo

function isUrl(url: url | JsonRpcProvider): url is url {
  return typeof url === 'string' || ('url' in url && !('connection' in url))
}

/**
 * @param url - An RPC url or a JsonRpcProvider.
 */
export interface UrlConstructorArgs {
  actions: Actions
  url: url | JsonRpcProvider
}

export class Url extends Connector {
  /** {@inheritdoc Connector.provider} */
  public readonly provider: undefined
  /** {@inheritdoc Connector.customProvider} */
  public customProvider?: JsonRpcProvider

  private readonly url: url | JsonRpcProvider

  constructor({ actions, url }: UrlConstructorArgs) {
    super(actions)
    this.url = url
  }

  /** {@inheritdoc Connector.activate} */
  public async activate(): Promise<void> {
    if (!this.customProvider) {
      const cancelActivation = this.actions.startActivation()
      if (!isUrl(this.url)) this.customProvider = this.url
      await import('@ethersproject/providers')
        .then(({ JsonRpcProvider }) => {
          this.customProvider = new JsonRpcProvider(this.url as url)
        })
        .catch((error) => {
          cancelActivation()
          throw error
        })
    }

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const { chainId } = await this.customProvider!.getNetwork()
    this.actions.update({ chainId, accounts: [] })
  }
}
