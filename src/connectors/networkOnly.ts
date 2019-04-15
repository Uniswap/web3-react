import { RPCSubprovider, Web3ProviderEngine } from '@0x/subproviders'

import { Provider } from '../manager'
import Connector, { ConnectorArguments } from './connector'

interface NetworkOnlyConnectorArguments extends ConnectorArguments {
  readonly providerURL: string
}

export default class NetworkOnlyConnector extends Connector {
  private engine: any
  private readonly providerURL: any

  public constructor(kwargs: NetworkOnlyConnectorArguments) {
    const { providerURL, ...rest } = kwargs
    super(rest)
    this.providerURL = providerURL
  }

  public async onActivation(): Promise<void> {
    if (!this.engine) {
      const engine = new Web3ProviderEngine()
      this.engine = engine
      this.engine.addProvider(new RPCSubprovider(this.providerURL))
    }

    this.engine.start()
  }

  public async getProvider(): Promise<Provider> {
    return this.engine
  }

  public async getAccount(): Promise<null> {
    return null
  }

  public onDeactivation(): void {
    if (this.engine) {
      this.engine.stop()
    }
  }
}
