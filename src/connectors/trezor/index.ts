// TODO change when TrezorSubprovider officially gets added to 0x/subproviders
// TODO add event listeners per https://github.com/trezor/connect/blob/develop/docs/events.md
// TODO add multiple network support?
import { RPCSubprovider, Web3ProviderEngine } from '@0x/subproviders'
import TrezorConnect from 'trezor-connect'

import { Provider } from '../../types'
import Connector from '../connector'
import TrezorSubprovider from './subprovider'

interface ISupportedNetworkURLs {
  readonly [propName: string]: string
}

interface ITrezorConnectorArguments {
  readonly supportedNetworkURLs: ISupportedNetworkURLs
  readonly defaultNetwork: number
  readonly manifestEmail: string
  readonly manifestAppUrl: string
}

export default class TrezorConnector extends Connector {
  private supportedNetworkURLs: ISupportedNetworkURLs
  private defaultNetwork: number
  private readonly manifestEmail: string
  private readonly manifestAppUrl: string

  constructor(kwargs: ITrezorConnectorArguments) {
    const { supportedNetworkURLs, defaultNetwork, manifestEmail, manifestAppUrl } = kwargs
    const supportedNetworks = Object.keys(supportedNetworkURLs).map(supportedNetworkURL => Number(supportedNetworkURL))
    super({ supportedNetworks })

    this.supportedNetworkURLs = supportedNetworkURLs
    this.defaultNetwork = defaultNetwork
    this.manifestEmail = manifestEmail
    this.manifestAppUrl = manifestAppUrl
  }

  public async getProvider(networkId?: number): Promise<Provider> {
    // we have to validate here because networkId might not be a key of supportedNetworkURLs
    const networkIdToUse = networkId || this.defaultNetwork
    super._validateNetworkId(networkIdToUse)

    TrezorConnect.manifest({
      appUrl: this.manifestAppUrl,
      email: this.manifestEmail
    })

    const trezorSubprovider = new TrezorSubprovider({
      accountFetchingConfigs: { numAddressesToReturn: 1 },
      networkId: networkIdToUse,
      trezorConnectClientApi: TrezorConnect
    })

    const engine = new Web3ProviderEngine()
    this.engine = engine
    engine.addProvider(trezorSubprovider)
    engine.addProvider(new RPCSubprovider(this.supportedNetworkURLs[networkIdToUse]))
    engine.start()

    return engine
  }

  public onDeactivation(): void {
    if (this.engine) {
      this.engine.stop()
    }
  }
}
