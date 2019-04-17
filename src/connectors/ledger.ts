import {
  ledgerEthereumBrowserClientFactoryAsync,
  LedgerSubprovider,
  RPCSubprovider,
  Web3ProviderEngine
} from '@0x/subproviders'

import { Provider } from '../manager'
import Connector from './connector'

interface SupportedNetworkURLs {
  readonly [propName: string]: string
}

interface LedgerConnectorArguments {
  readonly supportedNetworkURLs: SupportedNetworkURLs
  readonly defaultNetwork: number
}

export default class LedgerConnector extends Connector {
  public readonly supportedNetworkURLs: SupportedNetworkURLs
  public readonly defaultNetwork: number
  private engine: any

  public constructor(kwargs: LedgerConnectorArguments) {
    const { supportedNetworkURLs, defaultNetwork } = kwargs
    const supportedNetworks = Object.keys(supportedNetworkURLs).map(
      (supportedNetworkURL): number => Number(supportedNetworkURL)
    )
    super({ supportedNetworks })

    this.supportedNetworkURLs = supportedNetworkURLs
    this.defaultNetwork = defaultNetwork
  }

  public async getProvider(networkId?: number): Promise<Provider> {
    // we have to validate here because networkId might not be a key of supportedNetworkURLs
    const networkIdToUse = networkId || this.defaultNetwork
    super._validateNetworkId(networkIdToUse)

    const ledgerSubprovider = new LedgerSubprovider({
      accountFetchingConfigs: { numAddressesToReturn: 1 },
      ledgerEthereumClientFactoryAsync: ledgerEthereumBrowserClientFactoryAsync,
      networkId: networkIdToUse
    })

    const engine = new Web3ProviderEngine()
    this.engine = engine
    engine.addProvider(ledgerSubprovider)
    engine.addProvider(new RPCSubprovider(this.supportedNetworkURLs[networkIdToUse]))
    engine.start()

    return engine
  }

  public onDeactivation(): void {
    if (this.engine) {
      this.engine.stop()
    }
  }

  public changeNetwork(networkId: number): void {
    // proactively handle wrong network errors
    try {
      super._validateNetworkId(networkId)

      super._web3ReactUpdateHandler({ updateNetworkId: true, networkId })
    } catch (error) {
      super._web3ReactErrorHandler(error)
    }
  }
}
