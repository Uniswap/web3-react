import { ConnectorUpdate } from '@web3-react/types'
import { AbstractConnector } from '@web3-react/abstract-connector'

const CHAIN_ID = 1

interface MewConnectConnectorArguments {
  url: string
}

export class MewConnectConnector extends AbstractConnector {
  public mewConnect: any
  private readonly url: string
  private provider: any

  constructor({ url }: MewConnectConnectorArguments) {
    super({ supportedChainIds: [CHAIN_ID] })

    this.url = url
  }

  public async activate(): Promise<ConnectorUpdate> {
    const { default: MewConnect } = await import('@myetherwallet/mewconnect-web-client')
    if (!MewConnect.Provider.isConnected) {
      this.mewConnect = new MewConnect.Provider()
      // Requires the use of websockets.
      let url = this.url.includes('https://mainnet.infura.io/v3/')
        ? this.url.replace('https:', 'wss:').replace('infura.io/v3', 'infura.io/ws/v3')
        : this.url
      this.provider = this.mewConnect.makeWeb3Provider(CHAIN_ID, url, true)
      this.mewConnect.on('disconnected', () => {
        this.emitDeactivate()
      })
    }

    const account = await this.mewConnect.enable().then((accounts: string[]): string => accounts[0])

    return { provider: this.provider, chainId: CHAIN_ID, account: account }
  }

  public async getProvider(): Promise<any> {
    return this.provider
  }

  public async getChainId(): Promise<number> {
    return CHAIN_ID
  }

  public async getAccount(): Promise<null | string> {
    return this.provider.send('eth_accounts').then((accounts: string[]): string => accounts[0])
  }

  public deactivate() {
    this.provider.close()
    this.emitDeactivate()
  }

  public async close() {
    this.provider.close()
    this.emitDeactivate()
  }
}
