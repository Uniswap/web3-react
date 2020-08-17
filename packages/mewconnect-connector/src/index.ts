import {ConnectorUpdate} from '@web3-react/types'
import {AbstractConnector} from '@web3-react/abstract-connector'

const CHAIN_ID = 1

interface MewConnectConnectorArguments {
  url: string;
  infuraId?: string | undefined;
  windowClosedError?: boolean | undefined;
  subscriptionNotFoundNoThrow?: boolean | undefined;
}

interface MewConnectProviderOptions {
  chainId: string | number | undefined;
  noUrlCheck: boolean;
  rpcUrl: string |  undefined;
  infuraId: string | undefined;
  windowClosedError: boolean | undefined;
  subscriptionNotFoundNoThrow: boolean | undefined;
}

export class MewConnectConnector extends AbstractConnector {
  public mewConnect: any
  private readonly url: string
  private provider: any
  private readonly windowClosedError : boolean | undefined;
  private readonly subscriptionNotFoundNoThrow : boolean | undefined;
  private readonly infuraId : string | undefined;

  constructor(args : MewConnectConnectorArguments) {
    super({supportedChainIds: [CHAIN_ID]})
    const {url, windowClosedError, subscriptionNotFoundNoThrow , infuraId} = args;
    this.url = url
    this.windowClosedError = windowClosedError || true;
    this.subscriptionNotFoundNoThrow =
        subscriptionNotFoundNoThrow || true;
    this.infuraId = infuraId;
  }

  public async activate(): Promise<ConnectorUpdate> {
    const {default: MewConnect} = await import('@myetherwallet/mewconnect-web-client')
    let account;
    if (!MewConnect.Provider.isConnected) {
      const options: MewConnectProviderOptions  = {
        chainId: CHAIN_ID,
        noUrlCheck: true,
        rpcUrl: undefined,
        infuraId: this.infuraId,
        windowClosedError: this.windowClosedError,
        subscriptionNotFoundNoThrow: this.subscriptionNotFoundNoThrow
      };

      if (this.url.includes('https://mainnet.infura.io/v3/') && !options.infuraId) {
        options.infuraId = this.url.replace('https://mainnet.infura.io/v3/', '')
      } else {
        options.rpcUrl = this.url;
      }

      this.mewConnect = new MewConnect.Provider(options);
      // Requires the use of websockets.
      this.provider = this.mewConnect.makeWeb3Provider()
      this.mewConnect.on('disconnected', () => {
        this.emitDeactivate();
      })

      account = await this.mewConnect
          .enable()
          .catch(() => {
            throw new Error('The user rejected the request.');
          })
          .then((accounts: string[]): string => accounts[0]);
      return {provider: this.provider, chainId: CHAIN_ID, account: account}
    } else if (this.mewConnect) {
      account = await this.mewConnect
          .enable()
          .catch(() => {
            throw new Error('The user rejected the request.');
          })
          .then((accounts: string[]): string => accounts[0]);

      return {provider: this.provider, chainId: CHAIN_ID, account: account}
    }

    // const account = await this.mewConnect.enable().then((accounts: string[]): string => accounts[0])

    return {provider: this.provider, chainId: CHAIN_ID, account: account}
  }

  public async getProvider(): Promise<any> {
    return this.provider
  }

  public async getChainId(): Promise<number> {
    return CHAIN_ID
  }

  public async getAccount(): Promise<null | string> {
    return this.provider.send('eth_accounts')
        .then((accounts: string[]): string => accounts[0])
        .catch(() => {
          throw new Error('No account present to get.');
        })
  }

  public deactivate() {
    if (this.provider) {
      this.provider.close()
    }
    this.emitDeactivate()
  }

  public async close() {
    if (this.provider) {
      this.provider.close()
    }
    this.emitDeactivate()
  }
}
