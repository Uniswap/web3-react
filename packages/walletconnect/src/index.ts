import type WalletConnectProvider from '@walletconnect/ethereum-provider'
import type { IWCEthRpcConnectionOptions } from '@walletconnect/types'
import { Actions, Connector } from '@web3-react/types'
import type { EventEmitter } from 'node:events'

interface MockWalletConnectProvider
  extends Omit<WalletConnectProvider, 'on' | 'off' | 'once' | 'removeListener'>,
    EventEmitter {}

export class WalletConnect extends Connector {
  private readonly options?: IWCEthRpcConnectionOptions
  private eagerConnection?: Promise<void>

  public provider: MockWalletConnectProvider | undefined

  constructor(actions: Actions, options: IWCEthRpcConnectionOptions, connectEagerly = true) {
    super(actions)
    this.options = options

    if (connectEagerly) {
      this.eagerConnection = this.initialize(true)
    }
  }

  private async initialize(connectEagerly: boolean): Promise<void> {
    if (connectEagerly) {
      this.actions.startActivation()
    }

    return import('@walletconnect/ethereum-provider').then((m) => {
      this.provider = new m.default(this.options) as unknown as MockWalletConnectProvider

      this.provider.on('disconnect', (error: Error): void => {
        this.actions.reportError(error)
      })
      this.provider.on('chainChanged', (chainId: number): void => {
        this.actions.update({ chainId })
      })
      this.provider.on('accountsChanged', (accounts: string[]): void => {
        this.actions.update({ accounts })
      })

      if (connectEagerly) {
        if (this.provider.connected) {
          return Promise.all([
            this.provider.request({ method: 'eth_chainId' }) as Promise<number>,
            this.provider.request({ method: 'eth_accounts' }) as Promise<string[]>,
          ])
            .then(([chainId, accounts]) => {
              if (accounts.length) {
                this.actions.update({ chainId, accounts })
              } else {
                throw new Error('No accounts returned')
              }
            })
            .catch((error) => {
              console.debug('Could not connect eagerly', error)
              this.actions.reset()
            })
        } else {
          this.actions.reset()
        }
      }
    })
  }

  public async activate(): Promise<void> {
    this.actions.startActivation()

    if (!this.eagerConnection) {
      this.eagerConnection = this.initialize(false)
    }
    await this.eagerConnection

    return Promise.all([
      this.provider!.request({ method: 'eth_chainId' }) as Promise<number>,
      this.provider!.request({ method: 'eth_requestAccounts' }) as Promise<string[]>,
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
      return this.provider.disconnect()
    }
  }
}
