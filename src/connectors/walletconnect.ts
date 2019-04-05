import { RPCSubprovider, Web3ProviderEngine } from '@0x/subproviders'
import WalletConnectSubprovider from '@walletconnect/web3-subprovider'

import { Provider } from '../types'
import Connector from './connector'

interface ISupportedNetworkURLs {
  readonly [propName: string]: string
}

interface IWalletConnectConnectorArguments {
  readonly bridge: string
  readonly supportedNetworkURLs: ISupportedNetworkURLs
  readonly defaultNetwork: number
}

export default class WalletConnectConnector extends Connector {
  public readonly walletConnector: any
  public readonly supportedNetworkURLs: ISupportedNetworkURLs
  public readonly defaultNetwork: number
  private walletConnectSubprovider: any
  private engine: any

  constructor(kwargs: IWalletConnectConnectorArguments) {
    const { bridge, supportedNetworkURLs, defaultNetwork } = kwargs
    const supportedNetworks = Object.keys(supportedNetworkURLs).map(supportedNetworkURL => Number(supportedNetworkURL))
    super({ supportedNetworks })

    this.supportedNetworkURLs = supportedNetworkURLs
    this.defaultNetwork = defaultNetwork

    const walletConnectSubprovider = new WalletConnectSubprovider({ bridge })
    this.walletConnectSubprovider = walletConnectSubprovider
    this.walletConnector = this.walletConnectSubprovider._walletConnector

    this.connectAndSessionUpdateHandler = this.connectAndSessionUpdateHandler.bind(this)
    this.disconnectHandler = this.disconnectHandler.bind(this)
  }

  public async onActivation(): Promise<void> {
    if (!this.walletConnector.connected) {
      await this.walletConnector.createSession()
    }

    // initialize event listeners
    this.walletConnector.on('connect', this.connectAndSessionUpdateHandler)
    this.walletConnector.on('session_update', this.connectAndSessionUpdateHandler)
    this.walletConnector.on('disconnect', this.disconnectHandler)
  }

  public async getProvider(networkId?: number): Promise<Provider> {
    // this should never happened, because it probably means there was a funky walletconnect race condition
    if (networkId && this.walletConnector.chainId && networkId !== this.walletConnector.chainId) {
      throw Error('Unexpected Error in WalletConnectConnector. Please file an issue on Github.')
    }

    // we have to validate here because networkId might not be a key of supportedNetworkURLs
    const networkIdToUse = this.walletConnector.chainId || networkId || this.defaultNetwork
    super._validateNetworkId(networkIdToUse)

    const engine = new Web3ProviderEngine()
    this.engine = engine
    engine.addProvider(this.walletConnectSubprovider)
    engine.addProvider(new RPCSubprovider(this.supportedNetworkURLs[networkIdToUse]))
    engine.start()

    return engine
  }

  public async getAccount(provider: Provider): Promise<string | null> {
    if (this.walletConnector.connected) {
      return super.getAccount(provider)
    } else {
      return null
    }
  }

  public onDeactivation(): void {
    // TODO remove listeners here once exposed in walletconnect
    if (this.engine) {
      this.engine.stop()
    }
  }

  // walletconnect event handlers
  private connectAndSessionUpdateHandler(error: Error, payload: any): void {
    if (error) {
      super._web3ReactErrorHandler(error)
    } else {
      const { chainId, accounts } = payload.params[0]
      super._web3ReactUpdateNetworkIdAndAccountHandler(chainId, accounts[0])
    }
  }

  private disconnectHandler(error: Error): void {
    if (error) {
      super._web3ReactErrorHandler(error)
    } else {
      super._web3ReactResetHandler()
    }
  }
}
