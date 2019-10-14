import { Provider } from '../manager'
import Connector, { ConnectorArguments } from './connector'

interface SquarelinkConnectorArguments extends ConnectorArguments {
  readonly api: any
  readonly clientId: string
  readonly network: any
  readonly options?: any
}

export default class SquarelinkConnector extends Connector {
  public squarelink: any
  private Squarelink: any
  private readonly clientId: string
  private readonly network: any
  private readonly options: any

  public constructor(kwargs: SquarelinkConnectorArguments) {
    const { api: Squarelink, clientId, network, options, ...rest } = kwargs
    super(rest)

    this.Squarelink = Squarelink
    this.clientId = dAppId
    this.network = network
    this.options = options
  }

  public async onActivation(): Promise<void> {
    if (!this.squarelink) {
      this.squarelink = new this.Squarelink(this.clientId, this.network, this.options)
    }
  }

  public async getProvider(): Promise<Provider> {
    return await this.squarelink.getProvider()
  }
}
