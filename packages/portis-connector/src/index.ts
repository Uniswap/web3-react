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

type Network = number | { chainId: string; [key: string]: any }

interface PortisConnectorArguments {
  dAppId: string
  networks: Network[]
  config?: any
}

export class PortisConnector extends AbstractConnector {
  private readonly dAppId: string
  private readonly networks: Network[]
  private readonly config: any

  public portis: any

  constructor({ dAppId, networks, config = {} }: PortisConnectorArguments) {
    const chainIds = networks.map((n): number => (typeof n === 'number' ? n : Number(n.chainId)))
    invariant(
      chainIds.every((c): boolean => !!chainIdToNetwork[c]),
      `One or more unsupported networks ${networks}`
    )
    super({ supportedChainIds: chainIds })

    this.dAppId = dAppId
    this.networks = networks
    this.config = config

    this.handleOnLogout = this.handleOnLogout.bind(this)
    this.handleOnActiveWalletChanged = this.handleOnActiveWalletChanged.bind(this)
    this.handleOnError = this.handleOnError.bind(this)
  }

  private handleOnLogout(): void {
    if (__DEV__) {
      console.log("Handling 'onLogout' event")
    }
    this.emitDeactivate()
  }

  private handleOnActiveWalletChanged(account: string): void {
    if (__DEV__) {
      console.log("Handling 'onActiveWalletChanged' event with payload", account)
    }
    this.emitUpdate({ account })
  }

  private handleOnError(error: Error): void {
    if (__DEV__) {
      console.log("Handling 'onError' event")
    }
    this.emitError(error)
  }

  public async activate(): Promise<ConnectorUpdate> {
    if (!this.portis) {
      const { default: Portis } = await import('@portis/web3')
      this.portis = new Portis(
        this.dAppId,
        typeof this.networks[0] === 'number' ? chainIdToNetwork[this.networks[0]] : (this.networks[0] as any),
        this.config
      )
    }

    this.portis.onLogout(this.handleOnLogout)
    this.portis.onActiveWalletChanged(this.handleOnActiveWalletChanged)
    this.portis.onError(this.handleOnError)

    const account = await this.portis.provider.enable().then((accounts: string[]): string => accounts[0])

    return { provider: this.portis.provider, account }
  }

  public async getProvider(): Promise<any> {
    return this.portis.provider
  }

  public async getChainId(): Promise<number | string> {
    return this.portis.provider.send('eth_chainId')
  }

  public async getAccount(): Promise<null | string> {
    return this.portis.provider.send('eth_accounts').then((accounts: string[]): string => accounts[0])
  }

  public deactivate() {
    this.portis.onLogout(() => {})
    this.portis.onActiveWalletChanged(() => {})
    this.portis.onError(() => {})
  }

  public async changeNetwork(newNetwork: number | Network, isGasRelayEnabled?: boolean) {
    if (typeof newNetwork === 'number') {
      invariant(!!chainIdToNetwork[newNetwork], `Invalid chainId ${newNetwork}`)
      this.portis.changeNetwork(chainIdToNetwork[newNetwork], isGasRelayEnabled)
      this.emitUpdate({ chainId: newNetwork })
    } else {
      this.portis.changeNetwork(newNetwork, isGasRelayEnabled)
      this.emitUpdate({ chainId: Number(newNetwork.chainId) })
    }
  }

  public async close() {
    await this.portis.logout()
    this.emitDeactivate()
  }
}
export default PortisConnector
