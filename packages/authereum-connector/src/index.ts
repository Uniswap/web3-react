import { ConnectorUpdate } from '@web3-react/types'
import { AbstractConnector } from '@web3-react/abstract-connector'

const chainIdToNetwork: { [network: number]: string } = {
  42: 'kovan'
}

interface AuthereumConnectorArguments {
  chainId: number
}

export class AuthereumConnector extends AbstractConnector {
  private readonly chainId: number

  public authereum: any

  constructor({ chainId }: AuthereumConnectorArguments) {
    super({ supportedChainIds: [chainId] })

    this.chainId = chainId
  }

  public async activate(): Promise<ConnectorUpdate> {
    if (!this.authereum) {
      const { default: Authereum } = await import('authereum')
      this.authereum = new Authereum(chainIdToNetwork[this.chainId])
    }

    await this.authereum
      .getProvider()
      .enable()
      .then((accounts: string[]): string => accounts[0])

    return { provider: this.authereum.getProvider() }
  }

  public async getProvider(): Promise<any> {
    return this.authereum.getProvider()
  }

  public async getChainId(): Promise<number | string> {
    return this.authereum.getNetworkId()
  }

  public async getAccount(): Promise<null | string> {
    return this.authereum.getAccountAddress()
  }

  public deactivate() {}
}
