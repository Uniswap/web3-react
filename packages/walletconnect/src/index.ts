import type WalletConnectProvider from '@walletconnect/ethereum-provider'
import type { IWCEthRpcConnectionOptions } from '@walletconnect/types'
import type { Actions, ProviderRpcError } from '@web3-react/types'
import { Connector } from '@web3-react/types'
import type { EventEmitter } from 'node:events'

interface MockWalletConnectProvider
  extends Omit<WalletConnectProvider, 'on' | 'off' | 'once' | 'removeListener'>,
    EventEmitter {}

function parseChainId(chainId: string | number) {
  return typeof chainId === 'string' ? Number.parseInt(chainId) : chainId
}

export class WalletConnect extends Connector {
  /** {@inheritdoc Connector.provider} */
  provider: MockWalletConnectProvider | undefined

  private readonly options?: IWCEthRpcConnectionOptions
  private eagerConnection?: Promise<void>
  private treatModalCloseAsError: boolean

  /**
   * @param options - Options to pass to `@walletconnect/ethereum-provider`
   * @param connectEagerly - A flag indicating whether connection should be initiated when the class is constructed.
   */
  constructor(
    actions: Actions,
    options: IWCEthRpcConnectionOptions,
    connectEagerly = true,
    treatModalCloseAsError = true
  ) {
    super(actions)
    this.options = options
    this.treatModalCloseAsError = treatModalCloseAsError

    if (connectEagerly) {
      this.eagerConnection = this.initialize(true)
    }
  }

  private disconnectListener = (error: ProviderRpcError | undefined): void => {
    this.actions.reportError(error)
  }

  private chainChangedListener = (chainId: number | string): void => {
    this.actions.update({ chainId: parseChainId(chainId) })
  }

  private accountsChangedListener = (accounts: string[]): void => {
    this.actions.update({ accounts })
  }

  private async initialize(connectEagerly: boolean, chainId?: number): Promise<void> {
    let cancelActivation: () => void
    if (connectEagerly) {
      cancelActivation = this.actions.startActivation()
    }

    return import('@walletconnect/ethereum-provider').then((m) => {
      this.provider = new m.default({
        ...this.options,
        ...(chainId ? { chainId } : undefined),
      }) as unknown as MockWalletConnectProvider

      this.provider.on('disconnect', this.disconnectListener)
      this.provider.on('chainChanged', this.chainChangedListener)
      this.provider.on('accountsChanged', this.accountsChangedListener)

      if (connectEagerly) {
        if (this.provider.connected) {
          return (
            Promise.all([
              this.provider.request({ method: 'eth_chainId' }),
              this.provider.request({ method: 'eth_accounts' }),
            ]) as Promise<[number | string, string[]]>
          )
            .then(([chainId, accounts]) => {
              if (accounts?.length) {
                this.actions.update({ chainId: parseChainId(chainId), accounts })
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

  /**
   * Initiates a connection.
   *
   * @param desiredChainId - If defined, indicates the desired chain to connect to. If the user is
   * already connected to this chain, no additional steps will be taken. Otherwise, the user will be prompted to switch
   * to the chain, if their wallet supports it.
   */
  public async activate(desiredChainId?: number): Promise<void> {
    // if we're trying to connect to a specific chain, and we're not connected, we have to re-initialize
    if (desiredChainId && !this.provider?.connected && this.provider?.chainId !== desiredChainId) {
      await this.deactivate()
    }

    this.actions.startActivation()

    if (!this.eagerConnection) {
      this.eagerConnection = this.initialize(false, desiredChainId)
    }
    await this.eagerConnection

    try {
      // these are sequential instead of parallel because otherwise, chainId defaults to 1 even
      // if the connecting wallet isn't on mainnet
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const accounts = await this.provider!.request<string[]>({ method: 'eth_requestAccounts' })
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const chainId = parseChainId(await this.provider!.request<string | number>({ method: 'eth_chainId' }))

      // if there's no desired chain, or it's equal to the received, update
      if (!desiredChainId || chainId === desiredChainId) {
        return this.actions.update({ chainId, accounts })
      }

      // if we're here, we can try to switch networks
      const desiredChainIdHex = `0x${desiredChainId.toString(16)}`

      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      return this.provider!.request<void>({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: desiredChainIdHex }],
      })
    } catch (error) {
      // this condition is a bit of a hack :/
      // if a user triggers the walletconnect modal, closes it, and then tries to connect again, the modal will not trigger.
      // the logic below prevents this from happening
      if ((error as Error).message === 'User closed modal') {
        await this.deactivate(this.treatModalCloseAsError ? (error as Error) : undefined)
      } else {
        this.actions.reportError(error as Error)
      }
    }
  }

  /** {@inheritdoc Connector.deactivate} */
  public async deactivate(error?: Error): Promise<void> {
    if (this.provider) {
      this.provider.off('disconnect', this.disconnectListener)
      this.provider.off('chainChanged', this.chainChangedListener)
      this.provider.off('accountsChanged', this.accountsChangedListener)
      await this.provider.disconnect()
      this.provider = undefined
      this.eagerConnection = undefined
      this.actions.reportError(error)
    }
  }
}
