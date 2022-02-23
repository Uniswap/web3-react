import type { Eip1193Bridge } from '@ethersproject/experimental'
import type { ConnectionInfo } from '@ethersproject/web'
import type { Actions } from '@web3-react/types'
import { Connector } from '@web3-react/types'

type url = string | ConnectionInfo

export class Network extends Connector {
  /** {@inheritdoc Connector.provider} */
  public provider: Eip1193Bridge | undefined

  private urlMap: Record<number, url[]>
  private desiredChainId: number
  private providerCache: Partial<Record<number, Promise<Eip1193Bridge>>> = {}

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
    this.desiredChainId = Number(Object.keys(this.urlMap)[0])

    if (connectEagerly) void this.activate()
  }

  private async isomorphicInitialize(chainId: number) {
    if (this.providerCache[chainId]) return this.providerCache[chainId]

    await (this.providerCache[chainId] = Promise.all([
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
  public async activate(desiredChainId = this.desiredChainId): Promise<void> {
    const cancelActivation = this.actions.startActivation()

    this.desiredChainId = desiredChainId
    await this.isomorphicInitialize(desiredChainId)
    const provider = await this.providerCache[desiredChainId]

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return provider!
      .request({ method: 'eth_chainId' })
      .then((returnedChainId: number) => {
        // ensure the returned chainId is as expected, i.e. the provided url(s) are correct
        if (returnedChainId !== desiredChainId)
          throw new Error(`expected chainId ${desiredChainId}, received ${returnedChainId}`)

        if (this.desiredChainId === desiredChainId) {
          this.actions.update({ chainId: desiredChainId, accounts: [] })
        } else {
          cancelActivation()
        }
      })
      .catch((error: Error) => {
        this.actions.reportError(error)
      })
  }
}
