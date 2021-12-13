import { AbstractConnector } from '@web3-react/abstract-connector'
import { ConnectorUpdate } from '@web3-react/types'
import invariant from 'tiny-invariant'

const chainIdToNetwork: { [network: number]: string } = {
  1: 'mainnet',
  4: 'rinkeby',
  137: 'polygon',
  80001: 'mumbai',
}

interface BitskiConnectorArguments {
  clientId: string
  chainId: number,
  callbackUrl?: string
}

export class BitskiConnector extends AbstractConnector {
  private readonly clientId: string
  private readonly chainId: number
  private readonly callbackUrl?: string

  public bitski: any

  constructor({ clientId, chainId, callbackUrl }: BitskiConnectorArguments) {
    invariant(Object.keys(chainIdToNetwork).includes(chainId.toString()), `Unsupported chainId ${chainId}`)
    super({ supportedChainIds: [chainId] })

    this.clientId = clientId
    this.chainId = chainId
    this.callbackUrl = callbackUrl
  }

  public async activate(): Promise<ConnectorUpdate> {
    if (!this.bitski) {
      const { Bitski } = await import('bitski')
      this.bitski = new Bitski(
        this.clientId,
        this.callbackUrl,
      )
    }

    const network = {
      networkName: chainIdToNetwork[this.chainId],
    }

    const account = await this.bitski
      .signIn()
      .then((accounts: string[]): string => accounts[0])

    return { provider: this.bitski.getProvider(network), chainId: this.chainId, account }
  }

  public async getProvider(chainId?: number): Promise<any> {
    const network = {
      networkName: chainIdToNetwork[chainId || this.chainId],
    }

    return this.bitski.getProvider(network)
  }

  public async getChainId(): Promise<number | string> {
    return this.chainId
  }

  public async getAccount(): Promise<null | string> {
    return this.bitski
      .getProvider()
      .send('eth_accounts')
      .then((accounts: string[]): string => accounts[0])
  }

  public deactivate() { }

  public async close() {
    await this.bitski.signOut()
    this.emitDeactivate()
  }
}
