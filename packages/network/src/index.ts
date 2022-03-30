import type { FallbackProvider, JsonRpcProvider } from '@ethersproject/providers'
import type { ConnectionInfo } from '@ethersproject/web'
import type { Actions } from '@web3-react/types'
import { Connector } from '@web3-react/types'

type url = string | ConnectionInfo

export class Network extends Connector {
  /** {@inheritdoc Connector.provider} */
  public provider: undefined
  /** {@inheritdoc Connector.customProvider} */
  public customProvider: JsonRpcProvider | FallbackProvider | undefined

  private urlMap: Record<number, url[]>
  private defaultChainId: number
  private providerCache: Record<number, Promise<JsonRpcProvider | FallbackProvider> | undefined> = {}

  /**
   * @param urlMap - A mapping from chainIds to RPC urls.
   * @param connectEagerly - A flag indicating whether connection should be initiated when the class is constructed.
   * @param defaultChainId - The chainId to connect to if connectEagerly is true.
   */
  constructor(
    actions: Actions,
    urlMap: { [chainId: number]: url | url[] },
    connectEagerly = false,
    defaultChainId = Number(Object.keys(urlMap)[0])
  ) {
    super(actions)

    if (connectEagerly && typeof window === 'undefined') {
      throw new Error('connectEagerly = true is invalid for SSR, instead use the activate method in a useEffect')
    }

    this.urlMap = Object.keys(urlMap).reduce<{ [chainId: number]: url[] }>((accumulator, chainId) => {
      const urls = urlMap[Number(chainId)]
      accumulator[Number(chainId)] = Array.isArray(urls) ? urls : [urls]
      return accumulator
    }, {})
    this.defaultChainId = defaultChainId

    if (connectEagerly) void this.activate()
  }

  private async isomorphicInitialize(chainId: number): Promise<JsonRpcProvider | FallbackProvider> {
    if (this.providerCache[chainId]) return this.providerCache[chainId] as Promise<JsonRpcProvider | FallbackProvider>

    return (this.providerCache[chainId] = import('@ethersproject/providers')
      .then(({ JsonRpcProvider, FallbackProvider }) => ({
        JsonRpcProvider,
        FallbackProvider,
      }))
      .then(({ JsonRpcProvider, FallbackProvider }) => {
        const urls = this.urlMap[chainId]

        const providers = urls.map((url) => new JsonRpcProvider(url, chainId))

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
