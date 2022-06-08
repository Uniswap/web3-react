import type { JsonRpcProvider } from '@ethersproject/providers'
import type { ConnectionInfo } from '@ethersproject/web'
import type { Actions } from '@web3-react/types'
import { Connector } from '@web3-react/types'
import { getBestProvider } from './utils'

type url = string | ConnectionInfo

function isUrl(url: url | JsonRpcProvider): url is url {
  return typeof url === 'string' || ('url' in url && !('connection' in url))
}

/**
 * @param urlMap - A mapping from chainIds to RPC urls.
 * @param defaultChainId - The chainId to connect to in activate if one is not provided.
 * @param timeout - Timeout, in milliseconds, after which to treat network calls to urls as failed when selecting
 * online providers.
 */
export interface NetworkConstructorArgs {
  actions: Actions
  urlMap: { [chainId: number]: url | url[] | JsonRpcProvider | JsonRpcProvider[] }
  defaultChainId?: number
  timeout?: number
}

export class Network extends Connector {
  /** {@inheritdoc Connector.provider} */
  public readonly provider: undefined
  /** {@inheritdoc Connector.customProvider} */
  public customProvider?: JsonRpcProvider

  private readonly providerCache: Record<number, Promise<JsonRpcProvider> | undefined> = {}

  private readonly urlMap: Record<number, url[] | JsonRpcProvider[]>
  private readonly defaultChainId: number
  private readonly timeout: number

  constructor({
    actions,
    urlMap,
    defaultChainId = Number(Object.keys(urlMap)[0]),
    timeout = 5000,
  }: NetworkConstructorArgs) {
    super(actions)

    this.urlMap = Object.keys(urlMap).reduce<typeof this.urlMap>((accumulator, chainId) => {
      const urls = urlMap[Number(chainId)]

      if (Array.isArray(urls)) {
        accumulator[Number(chainId)] = urls
      } else {
        // thie ternary just makes typescript happy, since it can't infer that the array has elements of the same type
        accumulator[Number(chainId)] = isUrl(urls) ? [urls] : [urls]
      }

      return accumulator
    }, {})
    this.defaultChainId = defaultChainId
    this.timeout = timeout
  }

  private async isomorphicInitialize(chainId: number): Promise<JsonRpcProvider> {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    if (this.providerCache[chainId]) return this.providerCache[chainId]!

    const urls = this.urlMap[chainId]

    // early return if we have a single jsonrpc provider already
    if (urls.length === 1 && !isUrl(urls[0])) {
      return (this.providerCache[chainId] = Promise.resolve(urls[0]))
    }

    return (this.providerCache[chainId] = import('@ethersproject/providers').then(({ JsonRpcProvider }) => {
      const providers = urls.map((url) => (isUrl(url) ? new JsonRpcProvider(url, chainId) : url))
      return getBestProvider(providers, this.timeout)
    }))
  }

  /**
   * Initiates a connection.
   *
   * @param desiredChainId - The desired chain to connect to.
   */
  public async activate(desiredChainId = this.defaultChainId): Promise<void> {
    let cancelActivation: () => void
    if (!this.providerCache[desiredChainId]) {
      cancelActivation = this.actions.startActivation()
    }

    return this.isomorphicInitialize(desiredChainId)
      .then(async (customProvider) => {
        this.customProvider = customProvider

        const { chainId } = await this.customProvider.getNetwork()
        this.actions.update({ chainId, accounts: [] })
      })
      .catch((error: Error) => {
        cancelActivation?.()
        throw error
      })
  }
}
