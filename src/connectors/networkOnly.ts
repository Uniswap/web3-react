import { RPCSubprovider, Web3ProviderEngine } from '@0x/subproviders'

import { Provider } from '../types'
import Connector, { IConnectorArguments } from './connector'

interface INetworkOnlyConnectorArguments extends IConnectorArguments {
  readonly providerURL: string
}

export default class NetworkOnlyConnector extends Connector {
  private readonly engine: any

  constructor(kwargs: INetworkOnlyConnectorArguments) {
    const { providerURL, ...rest } = kwargs
    super(rest)

    const engine = new Web3ProviderEngine()
    this.engine = engine
    engine.addProvider(new RPCSubprovider(providerURL))
  }

  public async onActivation(): Promise<void> {
    this.engine.start()
  }

  public async getProvider(): Promise<Provider> {
    return this.engine
  }

  public async getAccount(): Promise<null> {
    return null
  }

  public onDeactivation(): void {
    this.engine.stop()
  }
}
