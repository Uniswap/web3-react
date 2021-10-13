import { Connector, Actions, Provider } from '@web3-react/types'
import type { ConnectionInfo } from '@ethersproject/web'

type url = string | ConnectionInfo

export class Network extends Connector {
  public provider: Provider | undefined

  private providerCache: { [chainId: number]: Provider } = {}
  private readonly instantiateProvider: (chainId?: number) => Promise<void>

  constructor(actions: Actions, urlMap: { [chainId: number]: url | url[] }) {
    super(actions)

    this.instantiateProvider = async (chainId) => {
      if (typeof chainId === 'undefined') {
        chainId = Number(Object.keys(urlMap)[0])
      }

      // load provider from cache if possible
      if (this.providerCache[chainId]) {
        this.provider = this.providerCache[chainId]
      }

      // instantiate new provider
      const [{ JsonRpcProvider, FallbackProvider }, { Eip1193Bridge }] = await Promise.all([
        import('@ethersproject/providers'),
        import('@ethersproject/experimental'),
      ])

      let urls = urlMap[chainId]
      if (typeof urls === 'undefined') {
        throw new Error(`no urls provided for chainId ${chainId}`)
      }
      if (!Array.isArray(urls)) {
        urls = [urls]
      }

      const providers = urls.map((url) => new JsonRpcProvider(url, chainId))
      const provider = new Eip1193Bridge(
        // TODO: use VoidSigner here?
        providers[0].getSigner(),
        providers.length === 1 ? providers[0] : new FallbackProvider(providers)
      )

      this.providerCache[chainId] = provider
      this.provider = provider
    }
  }

  public async activate(desiredChainId?: number): Promise<void> {
    this.actions.startActivation()

    await this.instantiateProvider(desiredChainId)
    // this.provider guaranteed to be defined now, and for the correct chainId

    const chainId = (await this.provider!.request({ method: 'eth_chainId' })) as number

    this.actions.update({ chainId, accounts: [] })
  }
}
