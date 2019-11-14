import { ConnectorUpdate } from '@web3-react/types'
import { AbstractConnector, UnsupportedChainIdError } from '@web3-react/abstract-connector'
import Fortmatic from 'fortmatic'
export { UnsupportedChainIdError }

const networkToChainId: { [network: string]: number } = {
  mainnet: 1,
  rinkeby: 4,
  ropsten: 3,
  kovan: 42
}

export interface FortmaticConnectorArguments {
  apiKey: string
  network?: string
}

export class FortmaticConnector extends AbstractConnector {
  private apiKey: string
  private network: string

  public fortmatic: any
  private provider: any

  constructor({ apiKey, network = 'rinkeby' }: FortmaticConnectorArguments) {
    super({ supportedChainIds: [networkToChainId[network]] })

    this.apiKey = apiKey
    this.network = network
  }

  public async activate(): Promise<ConnectorUpdate> {
    this.fortmatic = new Fortmatic(this.apiKey, this.network === 'mainnet' ? undefined : this.network)
    const { fortmatic } = this
    this.provider = fortmatic.getProvider()
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
    this.fortmatic = undefined
  }

  public async close() {
    await this.fortmatic.user.logout()
    this.emitDeactivate()
  }
}
