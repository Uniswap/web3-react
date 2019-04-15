import Portis from '@portis/web3'

import { Provider } from '../manager'
import Connector, { ConnectorArguments } from './connector'

interface PortisConnectorArguments extends ConnectorArguments {
  readonly dAppId: string
  readonly network: any
  readonly options?: any
}

export default class PortisConnector extends Connector {
  public portis: any
  private readonly dAppId: string
  private readonly network: any
  private readonly options: any

  public constructor(kwargs: PortisConnectorArguments) {
    const { dAppId, network, options, ...rest } = kwargs
    super(rest)

    this.dAppId = dAppId
    this.network = network
    this.options = options
  }

  public async onActivation(): Promise<void> {
    if (!this.portis) {
      this.portis = new Portis(this.dAppId, this.network, this.options)
    }
  }

  public async getProvider(): Promise<Provider> {
    return this.portis.provider
  }

  public changeNetwork(network: string): void {
    this.portis.changeNetwork(network)
    super._web3ReactUpdateHandler({ updateNetworkId: true })
  }
}
