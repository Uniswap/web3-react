import type {
  Actions,
  AddEthereumChainParameter,
  ProviderConnectInfo,
  ProviderRpcError,
} from '@web3-react/types';
import { Connector } from '@web3-react/types';
import { VenlyProvider, VenlyProviderOptions } from "@venly/web3-provider";

function parseChainId(chainId: string | number) {
  return typeof chainId === 'number' ? chainId : Number.parseInt(chainId, chainId.startsWith('0x') ? 16 : 10);
}

/**
 * @param options - Options to pass to VenlyProvider.
 * @param onError - Handler to report errors thrown from eventListeners.
 */
export interface VenlyConstructorArgs {
  actions: Actions;
  options: VenlyProviderOptions;
  onError?: (error: Error) => void;
}

export class Venly extends Connector {
  /** {@inheritdoc Connector.provider} */
  public provider: any;

  private readonly options: VenlyProviderOptions;
  private eagerConnection?: Promise<void>;
  private Venly = new VenlyProvider();

  constructor({ actions, options, onError }: VenlyConstructorArgs) {
    super(actions, onError);
    this.options = options;
  }

  private async isomorphicInitialize(): Promise<void> {
    if (this.eagerConnection) return;

    await (this.eagerConnection = this.Venly.createProviderEngine(this.options).then((provider) => {
      this.provider = provider;

      this.provider.on('connect', ({ chainId }: ProviderConnectInfo): void => {
        this.actions.update({ chainId: parseChainId(chainId) });
      })

      this.provider.on('disconnect', (error: ProviderRpcError): void => {
        this.actions.resetState();
        this.onError?.(error);
      })

      this.provider.on('chainChanged', (chainId: string): void => {
        this.actions.update({ chainId: parseChainId(chainId) });
      })

      this.provider.on('accountsChanged', (accounts: string[]): void => {
        if (accounts.length === 0)
          this.actions.resetState();
        else 
          this.actions.update({ accounts });
      })
    }))
  }

  /** {@inheritdoc Connector.connectEagerly} */
  public async connectEagerly(): Promise<void> {
    const cancelActivation = this.actions.startActivation();

    try {
      await this.isomorphicInitialize();
      if (!this.provider) throw new Error('No existing connection');

      // Wallets may resolve eth_chainId and hang on eth_accounts pending user interaction, which may include changing
      // chains; they should be requested serially, with accounts first, so that the chainId can settle.
      const [accounts, chainId] = await Promise.all([
        this.provider.request({ method: 'eth_accounts' }),
        this.provider.request({ method: 'eth_chainId' })
      ]);
      if (!accounts.length) throw new Error('No accounts returned');
      this.actions.update({ chainId: parseChainId(chainId), accounts });
    } 
    catch (error) {
      cancelActivation();
      throw error;
    }
  }

  /**
   * Initiates a connection.
   *
   * @param desiredChainIdOrChainParameters - If defined, indicates the desired chain to connect to. If the user is
   * already connected to this chain, no additional steps will be taken. Otherwise, the user will be prompted to switch
   * to the chain, if one of two conditions is met: either they already have it added, or the argument is of type
   * AddEthereumChainParameter, in which case the user will be prompted to add the chain with the specified parameters
   * first, before being prompted to switch.
   */
  public async activate(desiredChainIdOrChainParameters?: number | AddEthereumChainParameter): Promise<void> {
    const desiredChainId =
      typeof desiredChainIdOrChainParameters === 'number'
        ? desiredChainIdOrChainParameters
        : desiredChainIdOrChainParameters?.chainId

    const cancelActivation = this.actions.startActivation()

    try {
      await this.isomorphicInitialize()
      if (!this.provider) throw new Error('No provider');

      // Wallets may resolve eth_chainId and hang on eth_accounts pending user interaction, which may include changing
      // chains; they should be requested serially, with accounts first, so that the chainId can settle.
      const [accounts, chainId] = await Promise.all([
        this.provider.request({ method: 'eth_accounts' }),
        this.provider.request({ method: 'eth_chainId' })
      ]);
      const receivedChainId = parseChainId(chainId);

      if (!desiredChainId || desiredChainId === receivedChainId)
        return this.actions.update({ chainId: receivedChainId, accounts })

      //if we're here, we can try to switch networks
      const desiredChainIdHex = `0x${desiredChainId.toString(16)}`
      await this.provider.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: desiredChainIdHex }],
      });

      this.provider = this.Venly._provider;
      this.activate(desiredChainId);
    } catch (error) {
      cancelActivation()
      throw error
    }
  }

}