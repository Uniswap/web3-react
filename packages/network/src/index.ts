import type { Eip1193Bridge } from '@ethersproject/experimental'
import type { ConnectionInfo } from '@ethersproject/web'
import type { Actions } from '@web3-react/types'
import { Connector } from '@web3-react/types'

type url = string | ConnectionInfo

export class Network extends Connector {
  /** {@inheritdoc Connector.provider} */
  public provider: Eip1193Bridge | undefined

  private urlMap: Record<number, url[]>
  private providerCache: Record<number, Promise<Eip1193Bridge> | undefined> = {}

  /**
   * @param urlMap - A mapping from chainIds to RPC urls.
   * @param connectEagerly - A flag indicating whether connection should be initiated when the class is constructed.
   */
  constructor(actions: Actions, urlMap: { [chainId: number]: url | url[] }, connectEagerly = false) {
    super(actions)

    if (connectEagerly && typeof window === 'undefined') {
      throw new Error('connectEagerly = true is invalid for SSR, instead use the activate method in a useEffect')
    }

    this.urlMap = Object.keys(urlMap).reduce<{ [chainId: number]: url[] }>((accumulator, chainId) => {
      const urls = urlMap[Number(chainId)]
      accumulator[Number(chainId)] = Array.isArray(urls) ? urls : [urls]
      return accumulator
    }, {})

    if (connectEagerly) void this.activate()
  }

  private async isomorphicInitialize(chainId: number): Promise<Eip1193Bridge> {
    if (this.providerCache[chainId]) return this.providerCache[chainId] as Promise<Eip1193Bridge>

    return (this.providerCache[chainId] = Promise.all([
      import('@ethersproject/providers').then(({ JsonRpcProvider, FallbackProvider }) => ({
        JsonRpcProvider,
        FallbackProvider,
      })),
      import('@ethersproject/experimental').then(({ Eip1193Bridge }) => Eip1193Bridge),
    ]).then(([{ JsonRpcProvider, FallbackProvider }, Eip1193Bridge]) => {
      const urls = this.urlMap[chainId]

      const providers = urls.map((url) => new JsonRpcProvider(url, chainId))

      return new Eip1193Bridge(
        providers[0].getSigner(),
        providers.length === 1 ? providers[0] : new FallbackProvider(providers)
      )
    }))
  }

  /**
   * Initiates a connection.
   *
   * @param desiredChainId - The desired chain to connect to.
   */
  public async activate(desiredChainId = Number(Object.keys(this.urlMap)[0])): Promise<void> {
    this.actions.startActivation()

    this.provider = await this.isomorphicInitialize(desiredChainId)

    return this.provider
      .request({ method: 'eth_chainId' })
      .then((chainId: number) => {
        this.actions.update({ chainId, accounts: [] })
      })
      .catch((error: Error) => {
        this.actions.reportError(error)
      })
  }
}
