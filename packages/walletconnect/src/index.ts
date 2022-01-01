import type WalletConnectProvider from '@walletconnect/ethereum-provider'
import type { IWCEthRpcConnectionOptions } from '@walletconnect/types'
import type { Actions, ProviderRpcError } from '@web3-react/types'
import { Connector } from '@web3-react/types'
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
    let cancelActivation: () => void
    if (connectEagerly) {
      cancelActivation = this.actions.startActivation()
    }

    return import('@walletconnect/ethereum-provider').then((m) => {
      this.provider = new m.default(this.options) as unknown as MockWalletConnectProvider

      this.provider.on('disconnect', (error: ProviderRpcError): void => {
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
          return (
            Promise.all([
              this.provider.request({ method: 'eth_chainId' }),
              this.provider.request({ method: 'eth_accounts' }),
            ]) as Promise<[number, string[]]>
          )
            .then(([chainId, accounts]) => {
              if (accounts?.length) {
                this.actions.update({ chainId, accounts })
              } else {
                throw new Error('No accounts returned')
              }
            })
            .catch((error) => {
              console.debug('Could not connect eagerly', error)
              cancelActivation()
            })
        } else {
          cancelActivation()
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

    return (
      Promise.all([
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        this.provider!.request({ method: 'eth_chainId' }),
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        this.provider!.request({ method: 'eth_requestAccounts' }),
      ]) as Promise<[number, string[]]>
    )
      .then(([chainId, accounts]) => {
        this.actions.update({ chainId, accounts })
      })
      .catch((error: Error) => {
        this.actions.reportError(error)
      })
  }

  public async deactivate(): Promise<void> {
    if (this.provider) {
      return this.provider.disconnect()
    }
  }
}
