import { ConnectorUpdate } from '@web3-react/types'
import { AbstractConnector } from '@web3-react/abstract-connector'

interface TorusConnectorArguments {
  chainId: number
  initOptions?: any
  constructorOptions?: any,
  loginOptions?: any
}

export class TorusConnector extends AbstractConnector {
  private readonly chainId: number
  private readonly initOptions: any
  private readonly constructorOptions: any
  private readonly loginOptions: any

  public torus: any

  constructor({ chainId, initOptions = {}, constructorOptions = {}, loginOptions = {} }: TorusConnectorArguments) {
    super({ supportedChainIds: [chainId] })

    this.chainId = chainId
    this.initOptions = initOptions
    this.constructorOptions = constructorOptions
    this.loginOptions = loginOptions
  }

  public async activate(): Promise<ConnectorUpdate> {
    if (!this.torus) {
      const { default: Torus } = await import('@toruslabs/torus-embed')
      this.torus = new Torus(this.constructorOptions)
      await this.torus.init(this.initOptions)
    }

    const account = await this.torus.login(this.loginOptions).then((accounts: string[]): string => accounts[0])

    return { provider: this.torus.provider, account }
  }

  public async getProvider(): Promise<any> {
    return this.torus.provider
  }

  public async getChainId(): Promise<number | string> {
    return this.chainId
  }

  public async getAccount(): Promise<null | string> {
    return this.torus.ethereum.send('eth_accounts').then((accounts: string[]): string => accounts[0])
  }

  public async deactivate() {
    await this.torus.cleanUp()
    this.torus = undefined
  }

  public async close() {
    await this.torus.logout()
    this.emitDeactivate()
  }
}
