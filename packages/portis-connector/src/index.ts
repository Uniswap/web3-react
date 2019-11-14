import { ConnectorUpdate } from '@web3-react/types'
import { AbstractConnector, UnsupportedChainIdError } from '@web3-react/abstract-connector'
import Portis from '@portis/web3'
export { UnsupportedChainIdError }

const networkToChainId: { [network: string]: number } = {
  mainnet: 1,
  ropsten: 3,
  rinkeby: 4,
  kovan: 42,
  goerli: 5
}

export interface PortisConnectorArguments {
  dAppId: string
  network?: string
  config?: any
}

export class PortisConnector extends AbstractConnector {
  private dAppId: string
  private network: string
  private config: any

  public portis: any
  private provider: any

  constructor({ dAppId, network = 'mainnet', config = {} }: PortisConnectorArguments) {
    super({ supportedChainIds: [networkToChainId[network]] })

    this.dAppId = dAppId
    this.network = network
    this.config = config
  }

  public async activate(): Promise<ConnectorUpdate> {
    this.portis = new Portis(this.dAppId, this.network, this.config)
    const { portis } = this
    this.provider = portis.provider
    const { provider } = this

    const accounts = await provider.enable()
    return { provider, account: accounts[0] }
  }

  public async getProvider(): Promise<any> {
    return this.provider
  }

  public async getChainId(): Promise<number> {
    const chainId = await this.provider.send('eth_chainId').then((chainId: string): number => parseInt(chainId, 16))
    this.validateChainId(chainId)
    return chainId
  }

  public async getAccount(): Promise<null | string> {
    const accounts: string[] = await this.provider.send('eth_accounts')
    return accounts[0]
  }

  public deactivate() {
    this.provider = undefined
    this.portis = undefined
  }

  public async close() {
    await this.portis.logout()
    this.emitDeactivate()
  }
}
