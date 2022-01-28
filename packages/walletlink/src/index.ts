import type { Actions, AddEthereumChainParameter, ProviderConnectInfo, ProviderRpcError } from '@web3-react/types'
import { Connector } from '@web3-react/types'
import type { WalletLink as WalletLinkInstance } from 'walletlink'
import type { WalletLinkOptions } from 'walletlink/dist/WalletLink'

function parseChainId(chainId: string) {
  return Number.parseInt(chainId, 16)
}

export class WalletLink extends Connector {
  /** {@inheritdoc Connector.provider} */
  public provider: ReturnType<WalletLinkInstance['makeWeb3Provider']> | undefined

  private readonly options: WalletLinkOptions & { url: string }
  private eagerConnection?: Promise<void>

  /**
   * A `walletlink` instance.
   */
  public walletLink: WalletLinkInstance | undefined

  /**
   * @param options - Options to pass to `walletlink`
   * @param connectEagerly - A flag indicating whether connection should be initiated when the class is constructed.
   */
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
        const receivedChainId = parseChainId(chainId)

        // if there's no desired chain, or it's equal to the received, update
        if (!desiredChainId || receivedChainId === desiredChainId) {
          return this.actions.update({ chainId: receivedChainId, accounts })
        }

        // if we're here, we can try to switch networks
        const desiredChainIdHex = `0x${desiredChainId.toString(16)}`
        return this.provider
          ?.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: desiredChainIdHex }],
          })
          .catch((error: ProviderRpcError) => {
            if (error.code === 4902 && typeof desiredChainIdOrChainParameters !== 'number') {
              // if we're here, we can try to add a new network
              return this.provider?.request({
                method: 'wallet_addEthereumChain',
                params: [{ ...desiredChainIdOrChainParameters, chainId: desiredChainIdHex }],
              })
            } else {
              throw error
            }
          })
          .then(() => this.activate(desiredChainId))
      })
      .catch((error: Error) => {
        this.actions.reportError(error)
      })
  }

  /** {@inheritdoc Connector.deactivate} */
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
