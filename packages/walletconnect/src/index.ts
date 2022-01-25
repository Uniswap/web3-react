import type WalletConnectProvider from '@walletconnect/ethereum-provider'
import type { IWCEthRpcConnectionOptions } from '@walletconnect/types'
import type { Actions, ProviderRpcError } from '@web3-react/types'
import { Connector } from '@web3-react/types'
import type { EventEmitter } from 'node:events'

interface MockWalletConnectProvider
  extends Omit<WalletConnectProvider, 'on' | 'off' | 'once' | 'removeListener'>,
    EventEmitter {}

export class WalletConnect extends Connector {
  /** {@inheritdoc Connector.provider} */
  provider: MockWalletConnectProvider | undefined

  private readonly options?: IWCEthRpcConnectionOptions
  private eagerConnection?: Promise<void>

  /**
   * @param options - Options to pass to `@walletconnect/ethereum-provider`
   * @param connectEagerly - A flag indicating whether connection should be initiated when the class is constructed.
   */
  constructor(actions: Actions, options: IWCEthRpcConnectionOptions, connectEagerly = true) {
    super(actions)
    this.options = options

    if (connectEagerly) {
      this.eagerConnection = this.initialize(true)
    }
  }

  private disconnectListener = (error: ProviderRpcError | undefined): void => {
    this.actions.reportError(error)
  }

  private chainChangedListener = (chainId: number): void => {
    this.actions.update({ chainId })
  }

  private accountsChangedListener = (accounts: string[]): void => {
    this.actions.update({ accounts })
  }

  private async initialize(connectEagerly: boolean): Promise<void> {
    let cancelActivation: () => void
    if (connectEagerly) {
      cancelActivation = this.actions.startActivation()
    }

    return import('@walletconnect/ethereum-provider').then((m) => {
      this.provider = new m.default(this.options) as unknown as MockWalletConnectProvider

      this.provider.on('disconnect', this.disconnectListener)
      this.provider.on('chainChanged', this.chainChangedListener)
      this.provider.on('accountsChanged', this.accountsChangedListener)

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

  /** {@inheritdoc Connector.activate} */
  public async activate(): Promise<void> {
    this.actions.startActivation()

    if (!this.eagerConnection) {
      this.eagerConnection = this.initialize(false)
    }
    await this.eagerConnection

    try {
      // these are sequential instead of parallel because otherwise, chainId defaults to 1 even
      // if the connecting wallet isn't on mainnet
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const accounts: string[] = await this.provider!.request({ method: 'eth_requestAccounts' })
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const chainId: number = await this.provider!.request({ method: 'eth_chainId' })

      this.actions.update({ chainId, accounts })
    } catch (error) {
      // this condition is a bit of a hack :/
      // if a user triggers the walletconnect modal, closes it, and then tries to connect again, the modal will not trigger.
      // the logic below prevents this from happening
      if ((error as Error).message === 'User closed modal') {
        await this.deactivate()
      }

      this.actions.reportError(error as Error)
    }
  }

  /** {@inheritdoc Connector.deactivate} */
  public async deactivate(): Promise<void> {
    if (this.provider) {
      await this.provider.disconnect()
      this.provider.off('disconnect', this.disconnectListener)
      this.provider.off('chainChanged', this.chainChangedListener)
      this.provider.off('accountsChanged', this.accountsChangedListener)
      this.provider = undefined
      this.eagerConnection = undefined
    }
  }
}
