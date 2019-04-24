import { RPCSubprovider, Web3ProviderEngine } from '@0x/subproviders'

import { Provider } from '../manager'
import Connector from './connector'

interface SupportedNetworkURLs {
  readonly [propName: string]: string
}

interface WalletConnectConnectorArguments {
  readonly api: any
  readonly bridge: string
  readonly supportedNetworkURLs: SupportedNetworkURLs
  readonly defaultNetwork: number
}

export default class WalletConnectConnector extends Connector {
  private WalletConnectSubprovider: any
  public walletConnector: any
  public readonly supportedNetworkURLs: SupportedNetworkURLs
  public readonly defaultNetwork: number
  private readonly bridge: string
  private walletConnectSubprovider: any
  private engine: any

  public constructor(kwargs: WalletConnectConnectorArguments) {
    const { api: WalletConnectSubprovider, bridge, supportedNetworkURLs, defaultNetwork } = kwargs
    const supportedNetworks = Object.keys(supportedNetworkURLs).map(
      (supportedNetworkURL): number => Number(supportedNetworkURL)
    )
    super({ supportedNetworks })

    this.WalletConnectSubprovider = WalletConnectSubprovider
    this.bridge = bridge
    this.supportedNetworkURLs = supportedNetworkURLs
    this.defaultNetwork = defaultNetwork

    this.connectAndSessionUpdateHandler = this.connectAndSessionUpdateHandler.bind(this)
    this.disconnectHandler = this.disconnectHandler.bind(this)
  }

  public async onActivation(): Promise<void> {
    if (!this.walletConnectSubprovider && !this.walletConnector) {
      const walletConnectSubprovider = new this.WalletConnectSubprovider({ bridge: this.bridge })
      this.walletConnectSubprovider = walletConnectSubprovider
      this.walletConnector = this.walletConnectSubprovider._walletConnector
    }

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

      // proactively handle wrong network errors
      try {
        super._validateNetworkId(chainId)

        super._web3ReactUpdateHandler({
          updateNetworkId: true,
          updateAccount: true,
          networkId: chainId,
          account: accounts[0]
        })
      } catch (error) {
        super._web3ReactErrorHandler(error)
      }
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
