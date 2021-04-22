import { ConnectorUpdate } from '@web3-react/types'
import { AbstractConnector } from '@web3-react/abstract-connector'
import invariant from 'tiny-invariant'

const chainIdToNetwork: { [network: number]: string } = {
  1: 'mainnet',
  3: 'ropsten',
  4: 'rinkeby',
  5: 'goerli',
  42: 'kovan',
  100: 'xdai'
}

type Network = number | { chainId: number; [key: string]: any }

interface SquarelinkConnectorArguments {
  clientId: string
  networks: Network[]
  options?: any
}

export class SquarelinkConnector extends AbstractConnector {
  private readonly clientId: string
  private readonly networks: Network[]
  private readonly options: any

  public squarelink: any

  constructor({ clientId, networks, options = {} }: SquarelinkConnectorArguments) {
    const chainIds = networks.map((n): number => (typeof n === 'number' ? n : n.chainId))
    invariant(
      chainIds.every((c): boolean => !!chainIdToNetwork[c]),
      `One or more unsupported networks ${networks}`
    )
    super({ supportedChainIds: chainIds })

    this.clientId = clientId
    this.networks = networks
    this.options = options
  }

  public async activate(): Promise<ConnectorUpdate> {
    if (!this.squarelink) {
      const Squarelink = await import('squarelink').then(m => m?.default ?? m)
      this.squarelink = new Squarelink(
        this.clientId,
        typeof this.networks[0] === 'number' ? chainIdToNetwork[this.networks[0]] : this.networks[0],
        this.options
      )
    }

    const provider = await this.squarelink.getProvider()

    const account = await provider.enable().then((accounts: string[]): string => accounts[0])

    return { provider, account }
  }

  public async getProvider(): Promise<any> {
    return this.squarelink.getProvider()
  }

  public async getChainId(): Promise<number | string> {
    return this.squarelink.getProvider().then((provider: any) => provider.send('eth_chainId'))
  }

  public async getAccount(): Promise<null | string> {
    return this.squarelink
      .getProvider()
      .then((provider: any) => provider.send('eth_accounts').then((accounts: string[]): string => accounts[0]))
  }

  public deactivate() {}
}
