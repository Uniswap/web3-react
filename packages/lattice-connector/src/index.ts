import { ConnectorUpdate } from '@web3-react/types'
import { AbstractConnector } from '@web3-react/abstract-connector'
import Web3ProviderEngine from 'web3-provider-engine'
import { LatticeSubprovider } from '@0x/subproviders/lib/src/subproviders/lattice'
import CacheSubprovider from 'web3-provider-engine/subproviders/cache.js'
import { RPCSubprovider } from '@0x/subproviders/lib/src/subproviders/rpc_subprovider' // https://github.com/0xProject/0x-monorepo/issues/1400

interface LatticeConnectorArguments {
  chainId: number
  url: string
  pollingInterval?: number
  requestTimeoutMs?: number
  appName: string
}

export class LatticeConnector extends AbstractConnector {
  private readonly chainId: number
  private readonly url: string
  private readonly pollingInterval?: number
  private readonly requestTimeoutMs?: number
  private readonly appName: string
  private provider: any

  constructor({ chainId, url, pollingInterval, requestTimeoutMs, appName }: LatticeConnectorArguments) {
    super({ supportedChainIds: [chainId] })

    this.chainId = chainId
    this.url = url
    this.pollingInterval = pollingInterval
    this.requestTimeoutMs = requestTimeoutMs
    this.appName = appName
  }

  public async activate(): Promise<ConnectorUpdate> {
    if (!this.provider) {
      const LatticeKeyring = await import('eth-lattice-keyring').then(m => m?.default ?? m)
      const engine = new Web3ProviderEngine({ pollingInterval: this.pollingInterval })
      const opts = {
        appName: this.appName,
        latticeConnectClient: LatticeKeyring,
        networkId: this.chainId
      }
      engine.addProvider(new LatticeSubprovider(opts))
      engine.addProvider(new CacheSubprovider())
      engine.addProvider(new RPCSubprovider(this.url, this.requestTimeoutMs))
      this.provider = engine
    }

    this.provider.start()

    return { provider: this.provider, chainId: this.chainId }
  }

  public async getProvider(): Promise<Web3ProviderEngine> {
    return this.provider
  }

  public async getChainId(): Promise<number> {
    return this.chainId
  }

  public async getAccount(): Promise<null> {
    return this.provider._providers[0].getAccountsAsync(1).then((accounts: string[]): string => accounts[0])
  }

  public deactivate() {
    this.provider.stop()
  }

  public async close(): Promise<null> {
    this.emitDeactivate()
    // Due to limitations in the LatticeSubprovider API, we use this code with `getAccounts`
    // as a hack to allow us to close out the connection and forget data.
    // It will get handled in `eth-lattice-keyring`, which will forget the device and return
    // an empty array (whose first element will be null/undefined)
    const CLOSE_CODE = -1000
    return this.provider._providers[0].getAccountsAsync(CLOSE_CODE).then((accounts: string[]): string => accounts[0])
  }
}
