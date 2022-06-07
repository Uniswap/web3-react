import type { JsonRpcProvider } from '@ethersproject/providers'
import type { ConnectionInfo } from '@ethersproject/web'
import type { Actions } from '@web3-react/types'
import { Connector } from '@web3-react/types'
import { getBestProvider } from './utils'

type url = string | ConnectionInfo

function isUrl(url: url | JsonRpcProvider): url is url {
  return typeof url === 'string' || ('url' in url && !('connection' in url))
}

function isJsonRpcProvider(url: url | JsonRpcProvider): url is JsonRpcProvider {
  return !isUrl(url)
}

export class Network extends Connector {
  /** {@inheritdoc Connector.provider} */
  public readonly provider: undefined
  /** {@inheritdoc Connector.customProvider} */
  public customProvider: JsonRpcProvider | undefined

  private readonly timeout?: number

  private readonly urlMap: Record<number, url[] | JsonRpcProvider[]>
  private readonly defaultChainId: number
  private readonly providerCache: Record<number, Promise<JsonRpcProvider> | undefined> = {}

  /**
   * @param urlMap - A mapping from chainIds to RPC urls.
   * @param connectEagerly - A flag indicating whether connection should be initiated when the class is constructed.
   * @param defaultChainId - The chainId to connect to if connectEagerly is true.
   * @param timeout - Timeout, in milliseconds, after which to treat network calls as failed when selecting
   * online providers.
   */
  constructor({
    actions,
    urlMap,
    connectEagerly = false,
    defaultChainId = Number(Object.keys(urlMap)[0]),
    timeout,
  }: {
    actions: Actions
    urlMap: { [chainId: number]: url | url[] | JsonRpcProvider | JsonRpcProvider[] }
    connectEagerly?: boolean
    defaultChainId?: number
    timeout?: number
  }) {
    super(actions)

    if (connectEagerly && this.serverSide) {
      throw new Error('connectEagerly = true is invalid for SSR, instead use the activate method in a useEffect')
    }

    this.urlMap = Object.keys(urlMap).reduce<typeof this.urlMap>((accumulator, chainId) => {
      const urls = urlMap[Number(chainId)]

      if (Array.isArray(urls)) {
        accumulator[Number(chainId)] = urls
      } else {
        // thie ternary just makes typescript happy, since it can't infer that the array has elements of the same type
        accumulator[Number(chainId)] = isJsonRpcProvider(urls) ? [urls] : [urls]
      }

      return accumulator
    }, {})
    this.defaultChainId = defaultChainId
    this.timeout = timeout

    if (connectEagerly) void this.activate()
  }

  private async isomorphicInitialize(chainId: number): Promise<JsonRpcProvider> {
    if (this.providerCache[chainId]) return this.providerCache[chainId] as Promise<JsonRpcProvider>

    const urls = this.urlMap[chainId]

    // early return if we have a single jsonrpc provider already
    if (urls.length === 1 && isJsonRpcProvider(urls[0])) {
      return (this.providerCache[chainId] = Promise.resolve(urls[0]))
    }

    return (this.providerCache[chainId] = import('@ethersproject/providers')
      .then(({ JsonRpcProvider }) => JsonRpcProvider)
      .then((JsonRpcProvider) => {
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
    if (!this.customProvider) this.actions.startActivation()

    await this.isomorphicInitialize(desiredChainId)
      .then(async (customProvider) => {
        this.customProvider = customProvider

        const { chainId } = await this.customProvider.getNetwork()
        this.actions.update({ chainId, accounts: [] })
      })
      .catch((error: Error) => {
        this.actions.resetState()
        throw error
      })
  }
}
