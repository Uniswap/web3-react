import type { Actions, ProviderConnectInfo, ProviderRpcError } from '@web3-react/types'
import { Connector } from '@web3-react/types'
import type { WalletLink as WalletLinkInstance } from 'walletlink'
import type { WalletLinkOptions } from 'walletlink/dist/WalletLink'

function parseChainId(chainId: string) {
  return Number.parseInt(chainId, 16)
}

export class WalletLink extends Connector {
  private readonly options: WalletLinkOptions & { url: string }
  private eagerConnection?: Promise<void>

  public walletLink: WalletLinkInstance | undefined
  public provider: ReturnType<WalletLinkInstance['makeWeb3Provider']> | undefined

  constructor(actions: Actions, options: WalletLinkOptions & { url: string }, connectEagerly = true) {
    super(actions)
    this.options = options

    if (connectEagerly) {
      this.eagerConnection = this.initialize(true)
    }
  }

  private connectListener = ({ chainId }: ProviderConnectInfo): void => {
    this.actions.update({ chainId: parseChainId(chainId) })
  }

  private disconnectListener = (error: ProviderRpcError): void => {
    this.actions.reportError(error)
  }

  private chainChangedListener = (chainId: string): void => {
    this.actions.update({ chainId: parseChainId(chainId) })
  }

  private accountsChangedListener = (accounts: string[]): void => {
    this.actions.update({ accounts })
  }

  private async initialize(connectEagerly: boolean): Promise<void> {
    let cancelActivation: () => void
    if (connectEagerly) {
      cancelActivation = this.actions.startActivation()
    }

    const { url, ...options } = this.options

    return import('walletlink').then((m) => {
      if (!this.walletLink) {
        this.walletLink = new m.WalletLink(options)
      }
      this.provider = this.walletLink.makeWeb3Provider(url)

      this.provider.on('connect', this.connectListener)
      this.provider.on('disconnect', this.disconnectListener)
      this.provider.on('chainChanged', this.chainChangedListener)
      this.provider.on('accountsChanged', this.accountsChangedListener)

      if (connectEagerly) {
        return (
          Promise.all([
            this.provider.request({ method: 'eth_chainId' }),
            this.provider.request({ method: 'eth_accounts' }),
          ]) as Promise<[string, string[]]>
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
      ]) as Promise<[string, string[]]>
    )
      .then(([chainId, accounts]) => {
        this.actions.update({ chainId: parseChainId(chainId), accounts })
      })
      .catch((error: Error) => {
        this.actions.reportError(error)
      })
  }

  public deactivate(): void {
    if (this.provider) {
      this.provider.off('connect', this.disconnectListener)
      this.provider.off('disconnect', this.disconnectListener)
      this.provider.off('chainChanged', this.chainChangedListener)
      this.provider.off('accountsChanged', this.accountsChangedListener)
      this.provider = undefined
      this.eagerConnection = undefined
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      this.walletLink!.disconnect()
    }
  }
}
