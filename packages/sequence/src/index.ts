import type {
  Actions,
  Provider,
  ProviderRpcError,
} from '@web3-react/types'
import { Connector } from '@web3-react/types'
import { sequence } from '0xsequence'
import { WalletProvider } from '0xsequence/dist/declarations/src/provider';

declare const window: any

export interface SequenceOptions {
  appName?: string;
}

export class NoSequenceError extends Error {
  public constructor() {
    super('Sequence not installed')
    this.name = NoSequenceError.name
    Object.setPrototypeOf(this, NoSequenceError.prototype)
  }
}

function parseChainId(chainId: string | number) {
  if (typeof chainId === 'number') {
    return chainId
  }
  return Number.parseInt(chainId, 16)
}

export class Sequence extends Connector {
  public provider: Provider | undefined;

  private wallet?: WalletProvider
  private eagerConnection?: Promise<void>
  private readonly options?: SequenceOptions

  /**
   * @param options - Options to pass to the sequence wallet
   * @param connectEagerly - A flag indicating whether connection should be initiated when the class is constructed.
   */
  constructor(actions: Actions, connectEagerly = false, options?: SequenceOptions) {
    super(actions)
    this.options = options

    if (connectEagerly) {
      this.eagerConnection = this.activate();
    }
  }

  private disconnectListener = (error?: ProviderRpcError): void => {
    this.actions.reportError(error)
  }

  private chainChangedListener = (chainId: number | string): void => {
    this.actions.update({ chainId: parseChainId(chainId) })
  }

  private accountsChangedListener = (accounts: string[]): void => {
    this.actions.update({ accounts })
  }

  private async listenToEvents(): Promise<void> {
    if (this.provider) {
      this.provider.on('disconnect', this.disconnectListener)
      this.provider.on('accountsChanged', this.accountsChangedListener)
      this.provider.on('chainChanged', this.chainChangedListener)
    }
  }

  public async activate(defaultNetwork?: string | number): Promise<void> {
    const cancelActivation = this.actions.startActivation()

    if (window?.ethereum && window.ethereum.isSequence) {
      this.provider = window.ethereum;
      if (this.provider) {
        try {
          await this.provider.request({ method: 'eth_requestAccounts' })
          this.listenToEvents();
        } catch (error) {
          cancelActivation();
          this.actions.reportError(new Error("User Rejected"))
        }
        return;
      }
    }
  
    const wallet = new sequence.Wallet(defaultNetwork || 'mainnet');
  
    if (!wallet.isConnected()) {
      const connectDetails = await wallet.connect({
        app: this.options?.appName || 'app',
        authorize: true
      });
  
      if (!connectDetails.connected) {
        cancelActivation();
        this.actions.reportError(new Error("Failed to connect"))
      }
    }
  
    // The check for connection is necessary in case the user closes the popup or cancels
    if (wallet.isConnected()) {
      // @ts-ignore
      this.provider = wallet.getProvider();
      const walletAddress = await wallet.getAddress()
      const chainId = await wallet.getChainId()
      this.actions.update({
        chainId: parseChainId(chainId),
        accounts: [
          walletAddress,
        ],
      })
      // @ts-ignore
      this.provider.sequence = wallet;
      this.wallet = wallet;
      this.listenToEvents();
    }
  }

  public async deactivate(): Promise<void> {
    this.wallet?.disconnect();
    this.wallet = undefined;
    this.provider?.off('disconnect', this.disconnectListener)
    this.provider?.off('chainChanged', this.chainChangedListener)
    this.provider?.off('accountsChanged', this.accountsChangedListener)
    this.provider = undefined
    this.eagerConnection = undefined
    // Workaround for setting the isActive value to false upon disconnect
    this.actions.reportError(new Error('Disconnected'))
    this.actions.reportError(undefined)
  }
}
