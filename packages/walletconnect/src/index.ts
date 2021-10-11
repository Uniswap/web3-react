import { Actions, Connector, Provider } from '@web3-react/types'
import type { EventEmitter } from 'node:events'
import type WalletConnectProvider from '@walletconnect/ethereum-provider'
import type { IWCEthRpcConnectionOptions } from '@walletconnect/types'

interface MockWalletConnectProvider
  extends Omit<WalletConnectProvider, 'on' | 'off' | 'once' | 'removeListener'>,
    EventEmitter {}

export class WalletConnect extends Connector {
  private readonly options?: IWCEthRpcConnectionOptions
  private providerPromise?: Promise<void>

  public provider: MockWalletConnectProvider | undefined

  constructor(actions: Actions, options?: IWCEthRpcConnectionOptions, connectEagerly = true) {
    super(actions)
    this.options = options

    if (connectEagerly) {
      this.providerPromise = this.startListening(connectEagerly)
    }
  }

  private async startListening(connectEagerly: boolean): Promise<void> {
    const WalletConnectProvider = await import('@walletconnect/ethereum-provider').then((m) => m.default)

    this.provider = new WalletConnectProvider(this.options) as unknown as MockWalletConnectProvider

    this.provider.on('disconnect', (error: Error): void => {
      this.actions.reportError(error)
    })
    this.provider.on('chainChanged', (chainId: number): void => {
      this.actions.update({ chainId })
    })
    this.provider.on('accountsChanged', (accounts: string[]): void => {
      this.actions.update({ accounts })
    })

    // silently attempt to eagerly connect
    if (connectEagerly && this.provider.connected) {
      Promise.all([
        this.provider.request({ method: 'eth_chainId' }) as Promise<number>,
        this.provider.request({ method: 'eth_accounts' }) as Promise<string[]>,
      ])
        .then(([chainId, accounts]) => {
          if (accounts.length > 0) {
            this.actions.update({ chainId, accounts })
          }
        })
        .catch((error) => {
          console.debug('Could not connect eagerly', error)
        })
    }
  }

  public async activate(): Promise<void> {
    this.actions.startActivation()

    if (!this.providerPromise) {
      this.providerPromise = this.startListening(false)
    }
    await this.providerPromise
    // this.provider guaranteed to be defined now

    await Promise.all([
      (this.provider as Provider).request({ method: 'eth_chainId' }) as Promise<number>,
      (this.provider as Provider).request({ method: 'eth_requestAccounts' }) as Promise<string[]>,
    ])
      .then(([chainId, accounts]) => {
        this.actions.update({ chainId, accounts })
      })
      .catch((error) => {
        this.actions.reportError(error)
      })
  }

  public async deactivate(): Promise<void> {
    if (this.provider) {
      await this.provider.disconnect()
    }
  }
}
