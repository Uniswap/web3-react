import type { FallbackProvider, JsonRpcProvider } from '@ethersproject/providers'
import type { ConnectionInfo } from '@ethersproject/web'
import type { Actions } from '@web3-react/types'
import { Connector } from '@web3-react/types'

type url = string | ConnectionInfo

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function isUrl(url: url | any): url is url {
  return typeof url === 'string' || ('url' in url && !('connection' in url) && !('quorum' in url))
}

function isJsonRpcProvider(url: url | JsonRpcProvider | FallbackProvider): url is JsonRpcProvider {
  return !isUrl(url) && 'connection' in url && !('quorum' in url)
}

function isFallbackProvider(url: url | JsonRpcProvider | FallbackProvider): url is FallbackProvider {
  return !isUrl(url) && 'quorum' in url && !('connection' in url)
}

export class Network extends Connector {
  /** {@inheritdoc Connector.provider} */
  public readonly provider: undefined
  /** {@inheritdoc Connector.customProvider} */
  public customProvider: JsonRpcProvider | FallbackProvider | undefined

  private readonly urlMap: Record<number, url[] | JsonRpcProvider[] | FallbackProvider>
  private readonly defaultChainId: number
  private readonly providerCache: Record<number, Promise<JsonRpcProvider | FallbackProvider> | undefined> = {}

  /**
   * @param urlMap - A mapping from chainIds to RPC urls.
   * @param connectEagerly - A flag indicating whether connection should be initiated when the class is constructed.
   * @param defaultChainId - The chainId to connect to if connectEagerly is true.
   */
  constructor(
    actions: Actions,
    urlMap: { [chainId: number]: url | url[] | JsonRpcProvider | JsonRpcProvider[] | FallbackProvider },
    connectEagerly = false,
    defaultChainId = Number(Object.keys(urlMap)[0])
  ) {
    super(actions)

    if (connectEagerly && typeof window === 'undefined') {
      throw new Error('connectEagerly = true is invalid for SSR, instead use the activate method in a useEffect')
    }

    this.urlMap = Object.keys(urlMap).reduce<typeof this.urlMap>((accumulator, chainId) => {
      const urls = urlMap[Number(chainId)]

      if (Array.isArray(urls)) {
        accumulator[Number(chainId)] = urls
      } else {
        accumulator[Number(chainId)] = isFallbackProvider(urls) ? urls : isJsonRpcProvider(urls) ? [urls] : [urls]
      }

      return accumulator
    }, {})
    this.defaultChainId = defaultChainId

    if (connectEagerly) void this.activate()
  }

  private async isomorphicInitialize(chainId: number): Promise<JsonRpcProvider | FallbackProvider> {
    if (this.providerCache[chainId]) return this.providerCache[chainId] as Promise<JsonRpcProvider | FallbackProvider>

    const urls = this.urlMap[chainId]

    if (Array.isArray(urls)) {
      // early return if we have a single jsonrpc provider already
      if (urls.length === 1 && isJsonRpcProvider(urls[0]))
        return (this.providerCache[chainId] = Promise.resolve(urls[0]))
    } else {
      // if we're here we know urls is a FallbackProvider
      return (this.providerCache[chainId] = Promise.resolve(urls))
    }

    return (this.providerCache[chainId] = import('@ethersproject/providers')
      .then(({ JsonRpcProvider, FallbackProvider }) => ({
        JsonRpcProvider,
        FallbackProvider,
      }))
      .then(({ JsonRpcProvider, FallbackProvider }) => {
        const providers = urls.map((url) => (isUrl(url) ? new JsonRpcProvider(url, chainId) : url))
        return providers.length === 1 ? providers[0] : new FallbackProvider(providers)
      }))
  }

  /**
   * Initiates a connection.
   *
   * @param desiredChainId - The desired chain to connect to.
   */
  public async activate(desiredChainId = this.defaultChainId): Promise<void> {
    if (!this.customProvider) this.actions.startActivation()

    await this.isomorphicInitialize(desiredChainId)
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
