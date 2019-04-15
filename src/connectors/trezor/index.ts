// lightly adapted from https://github.com/0xProject/0x-monorepo/pull/1431
// TODO replace with offical implementation when TrezorSubprovider gets added to 0x/subproviders
// TODO add event listeners per https://github.com/trezor/connect/blob/develop/docs/events.md ?
import { RPCSubprovider, Web3ProviderEngine } from '@0x/subproviders'
import TrezorConnect from 'trezor-connect'

import { Provider } from '../../manager'
import Connector from '../connector'
import TrezorSubprovider from './subprovider'

interface SupportedNetworkURLs {
  readonly [propName: string]: string
}

interface TrezorConnectorArguments {
  readonly supportedNetworkURLs: SupportedNetworkURLs
  readonly defaultNetwork: number
  readonly manifestEmail: string
  readonly manifestAppUrl: string
}

export default class TrezorConnector extends Connector {
  private supportedNetworkURLs: SupportedNetworkURLs
  private defaultNetwork: number
  private readonly manifestEmail: string
  private readonly manifestAppUrl: string

  public constructor(kwargs: TrezorConnectorArguments) {
    const { supportedNetworkURLs, defaultNetwork, manifestEmail, manifestAppUrl } = kwargs
    const supportedNetworks = Object.keys(supportedNetworkURLs).map(
      (supportedNetworkURL): number => Number(supportedNetworkURL)
    )
    super({ supportedNetworks })

    this.supportedNetworkURLs = supportedNetworkURLs
    this.defaultNetwork = defaultNetwork
    this.manifestEmail = manifestEmail
    this.manifestAppUrl = manifestAppUrl
  }

  public async onActivation(): Promise<void> {
    TrezorConnect.manifest({
      appUrl: this.manifestAppUrl,
      email: this.manifestEmail
    })
  }

  public async getProvider(networkId?: number): Promise<Provider> {
    // we have to validate here because networkId might not be a key of supportedNetworkURLs
    const networkIdToUse = networkId || this.defaultNetwork
    super._validateNetworkId(networkIdToUse)

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

  public changeNetwork(networkId: number): void {
    super._web3ReactUpdateHandler({ updateNetworkId: true, networkId })
  }
}
