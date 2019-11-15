import { ConnectorUpdate } from '@web3-react/types'
import { AbstractConnector } from '@web3-react/abstract-connector'
import { Web3ProviderEngine, RPCSubprovider } from '@0x/subproviders' // use tree-shaking instead of dynamic import

export interface NetworkConnectorArguments {
  url: string
  chainId: number
  pollingInterval?: number
  requestTimeoutMs?: number
}

export class NetworkConnector extends AbstractConnector {
  private readonly url: string
  private readonly chainId: number
  private readonly pollingInterval?: number
  private readonly requestTimeoutMs?: number

  private provider: any

  constructor({ url, chainId, pollingInterval, requestTimeoutMs }: NetworkConnectorArguments) {
    super({ supportedChainIds: [chainId] })

    this.url = url
    this.chainId = chainId
    this.pollingInterval = pollingInterval
    this.requestTimeoutMs = requestTimeoutMs
  }

  public async activate(): Promise<ConnectorUpdate> {
    this.provider = new Web3ProviderEngine({ pollingInterval: this.pollingInterval })
    this.provider.addProvider(new RPCSubprovider(this.url, this.requestTimeoutMs))
    this.provider.start()

    return { provider: this.provider, account: null }
  }

  public async getProvider(): Promise<Web3ProviderEngine> {
    return this.provider
  }

  public async getChainId(): Promise<number> {
    return this.chainId
  }

  public async getAccount(): Promise<null> {
    return null
  }

  public deactivate() {
    this.provider = undefined
  }
}
