import { Actions, AddEthereumChainParameter, Connector, Provider, ProviderConnectInfo, ProviderRpcError, RequestArguments } from '@web3-react/types'

type TrustWalletProvider = Provider & {
  isTrust?: boolean;
  isTrustWallet?: boolean;
  providers?: Omit<TrustWalletProvider, 'providers'>[];
  isConnected: () => boolean;
  request<T>(args: RequestArguments): Promise<T>;
  chainId: string;
  selectedAddress: string;
};

interface TrustWalletConstructorArgs {
  actions: Actions;
  onError?: () => void;
}

type Window = typeof Window & {
  ethereum?: TrustWalletProvider;
  trustwallet?: TrustWalletProvider;
}

export class TrustWallet extends Connector {
  provider?: TrustWalletProvider

  private get connected() {
    return !!this.provider?.isConnected()
  }

  constructor({ actions, onError }: TrustWalletConstructorArgs) {
    super(actions, onError)
  }

  public activate(desiredChainIdOrChainParameters?: number | AddEthereumChainParameter): Promise<void> | undefined {
    if (!this.provider) {
      window.open('https://trustwallet.com/browser-extension/', '_blank')
      return
    }

    const desiredChainId =
      typeof desiredChainIdOrChainParameters === 'number'
        ? desiredChainIdOrChainParameters
        : desiredChainIdOrChainParameters?.chainId

    if (this.connected && desiredChainId && desiredChainId === this.parseChainId(this.provider.chainId)) {

      const desiredChainIdHex = `0x${desiredChainId.toString(16)}`

      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      return this.provider.request<void>({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: desiredChainIdHex }],
      }).catch(async (error: ProviderRpcError) => {
        console.log('err!', error);

        if (error.code === 4902 && typeof desiredChainIdOrChainParameters !== 'number') {
          // if we're here, we can try to add a new network
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          return this.provider!.request<void>({
            method: 'wallet_addEthereumChain',
            params: [{ ...desiredChainIdOrChainParameters, chainId: desiredChainIdHex }],
          })
        }

        throw error
      })
    }

    return Promise.all([
      this.provider.request({ method: 'eth_chainId' }) as Promise<string>,
      this.provider.request({ method: 'eth_requestAccounts' }) as Promise<string[]>,
    ]).then(([chainId, accounts]) => {

      const receivedChainId = this.parseChainId(chainId)
      
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      if (!desiredChainId || desiredChainId === receivedChainId) {
        return this.actions.update({ chainId: receivedChainId, accounts })
      }

      const desiredChainIdHex = `0x${desiredChainId.toString(16)}`

      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      return this.provider!.request<void>({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: desiredChainIdHex }],
      }).catch(async (error: ProviderRpcError) => {

        console.log('err!', error);
        
        if (error.code === 4902 && typeof desiredChainIdOrChainParameters !== 'number') {
          // if we're here, we can try to add a new network
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          return this.provider!.request<void>({
            method: 'wallet_addEthereumChain',
            params: [{ ...desiredChainIdOrChainParameters, chainId: desiredChainIdHex }],
          })
        }

        throw error
      })
    });
      
  }

  /** {@inheritdoc Connector.connectEagerly} */
  public async connectEagerly(): Promise<void> {

    this.isomorphicInitialize()

    if (!this.provider) return 

    return Promise.all([
      this.provider.request({ method: 'eth_chainId' }) as Promise<string>,
      this.provider.request({ method: 'eth_accounts' }) as Promise<string[]>,
    ])
      .then(([chainId, accounts]) => {
        if (accounts.length) {
          this.actions.update({ chainId: this.parseChainId(chainId), accounts })
        } else {
          throw new Error('No accounts returned')
        }
      })
      .catch((error) => {
        console.debug('Could not connect eagerly', error)
        this.actions.resetState()
      })
  }

  private detectProvider(): TrustWalletProvider | void {
    this.provider = this.isTrust((window as unknown as Window).ethereum) ||
      (window as unknown as Window).trustwallet ||
      (window as unknown as Window).ethereum?.providers?.find(
        (provider: Omit<TrustWalletProvider, 'providers'>) => provider.isTrust || provider.isTrustWallet
      )

    if (this.provider) {
      return this.provider
    }
  }

  private isTrust(ethereum?: TrustWalletProvider) {
    const isTrustWallet = !!ethereum?.isTrust || !!ethereum?.isTrustWallet
    if (!isTrustWallet) return
    return ethereum
  }

  private isomorphicInitialize(): void {
    const provider = this.detectProvider()

    if (provider) {
      provider.on('connect', ({ chainId }: ProviderConnectInfo): void => {
        this.actions.update({ chainId: this.parseChainId(chainId) })
      })

      provider.on('disconnect', (error: ProviderRpcError): void => {
        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        this.provider?.request({method: 'PUBLIC_disconnectSite'})

        this.actions.resetState()
        this.onError?.(error)
      })

      provider.on('chainChanged', (chainId: string): void => {

        this.actions.update({ chainId: Number(chainId) })
      })

      provider.on('accountsChanged', (accounts: string[]): void => {
        if (accounts.length === 0) {
          // handle this edge case by disconnecting
          this.actions.resetState()
        } else {
          this.actions.update({ accounts })
        }
      })
    }
  }

  private parseChainId(chainId: string) {
    return Number.parseInt(chainId, 16)
  }
}
