import { Connector, Actions, Provider } from '@web3-react/types'
import type { ConnectionInfo } from '@ethersproject/web'

type url = string | ConnectionInfo

export class Network extends Connector {
  private urlMap: { [chainId: number]: url[] }
  private chainId: number
  private providerCache: { [chainId: number]: Provider } = {}

  constructor(actions: Actions, urlMap: { [chainId: number]: url | url[] }, connectEagerly = true) {
    super(actions)
    this.urlMap = Object.keys(urlMap).reduce<{ [chainId: number]: url[] }>((accumulator, chainId) => {
      const urls = urlMap[Number(chainId)]
      accumulator[Number(chainId)] = Array.isArray(urls) ? urls : [urls]
      return accumulator
    }, {})
    // use the first chainId in urlMap as the default
    this.chainId = Number(Object.keys(this.urlMap)[0])

    if (connectEagerly) {
      this.initialize()
    }
  }

  private async initialize(): Promise<void> {
    // cache the desired chainId before async logic
    const chainId = this.chainId

    // populate the provider cache if necessary
    if (!this.providerCache[chainId]) {
      // instantiate new provider
      const [{ JsonRpcProvider, FallbackProvider }, { Eip1193Bridge }] = await Promise.all([
        import('@ethersproject/providers'),
        import('@ethersproject/experimental'),
      ])

      const urls = this.urlMap[chainId]

      const providers = urls.map((url) => new JsonRpcProvider(url, chainId))
      const provider = new Eip1193Bridge(
        providers[0].getSigner(),
        providers.length === 1 ? providers[0] : new FallbackProvider(providers)
      )

      this.providerCache[chainId] = provider
    }

    // once we're here, the cache is guaranteed to be initialized
    // so, if the current chainId still matches the one at the beginning of the call, update
    if (chainId === this.chainId) {
      const provider = this.providerCache[chainId]

      return provider
        .request({ method: 'eth_chainId' })
        .then((returnedChainId) => {
          if (returnedChainId !== chainId) {
            // this means the returned chainId was unexpected, i.e. the provided url(s) were wrong
            throw new Error(`expected chainId ${chainId}, received ${returnedChainId}`)
          }

          // again we have to make sure the chainIds match, to prevent race conditions
          if (chainId === this.chainId) {
            this.actions.update({ chainId, accounts: [] })
          }
        })
        .catch((error) => {
          this.actions.reportError(error)
        })
    }
  }

  public async activate(desiredChainId: number = Number(Object.keys(this.urlMap)[0])): Promise<void> {
    if (typeof this.urlMap[desiredChainId] === undefined) {
      throw new Error(`no url(s) provided for desiredChainId ${desiredChainId}`)
    }
    // set the connector's chainId to the target, to prevent race conditions
    this.chainId = desiredChainId

    this.actions.startActivation()

    return this.initialize()
  }
}
