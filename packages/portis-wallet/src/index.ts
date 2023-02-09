import type Portis from '@portis/web3'
import type { INetwork, IOptions } from '@portis/web3'
import type { ConnectorArgs, Provider, Web3ReactState } from '@web3-react/types'
import { Connector } from '@web3-react/types'

// https://docs.portis.io/#/configuration?id=network
const chainIdToNetwork: { [network: number]: string } = {
  1: 'mainnet',
  5: 'goerli',
  8: 'ubiq',
  18: 'thundercoreTestnet',
  30: 'orchid', // RSK
  31: 'orchidTestnet', // RSK Testnet
  61: 'classic',
  77: 'sokol',
  99: 'core',
  100: 'xdai',
  108: 'thundercore',
  122: 'fuse',
  163: 'lightstreams',
  137: 'matic',
  80001: 'maticMumbai',
}

interface PortisProvider extends Provider {
  isPortis: boolean
  isConnected(): boolean
  enable(): Promise<string>
  send(args: string): Promise<unknown>
}

type PortisWalletOptions = {
  dappId: string
  network: string | INetwork
  options?: IOptions
  defaultEmail?: string
}

/**
 * @param options - Options to pass to `@portis/web3`.
 * @param onError - Handler to report errors thrown from eventListeners.
 */
export interface PortisWalletConstructorArgs extends ConnectorArgs {
  options: PortisWalletOptions
}

export class NoPortisProviderError extends Error {
  public constructor() {
    super('Portis Wallet not installed')
    this.name = NoPortisProviderError.name
    Object.setPrototypeOf(this, NoPortisProviderError.prototype)
  }
}

export class PortisWallet extends Connector {
  /** {@inheritdoc Connector.provider} */
  public provider?: PortisProvider
  public portis?: Portis

  private readonly options: PortisWalletOptions
  private eagerConnection?: Promise<void>

  constructor({ actions, options, onError, connectorOptions }: PortisWalletConstructorArgs) {
    super(actions, onError, {
      ...connectorOptions,
      supportedChainIds:
        connectorOptions?.supportedChainIds ?? Object.keys(chainIdToNetwork).map((chainId) => Number(chainId)),
    })

    this.options = options
  }

  /**
   * Setup the provider and listen to its events.
   */
  private async isomorphicInitialize(): Promise<void> {
    if (this.eagerConnection) return

    await (this.eagerConnection = import('@portis/web3').then((m) => {
      this.portis = new m.default(this.options.dappId, this.options.network, this.options?.options)
      this.provider = this.portis?.provider as PortisProvider

      if (this.options?.defaultEmail) {
        this.portis.setDefaultEmail(this.options.defaultEmail)
      }

      this.portis?.onLogin((walletAddress: string) => {
        if (!walletAddress) {
          this.actions.resetState()
        } else {
          this.actions.update({ accounts: [walletAddress], accountIndex: 0 })
        }
      })

      this.portis?.onLogout(() => {
        this.actions.resetState()
      })

      this.portis?.onActiveWalletChanged((walletAddress: string) => {
        if (!walletAddress) {
          this.actions.resetState()
        } else {
          this.actions.update({ accounts: [walletAddress], accountIndex: 0 })
        }
      })

      this.portis?.onError((error: Error) => {
        this.actions.resetState()
        this.onError?.(error)
      })
    }))
  }

  /** {@inheritdoc Connector.connectEagerly} */
  public async connectEagerly(): Promise<Web3ReactState> {
    const cancelActivation = this.actions.startActivation()

    await this.isomorphicInitialize()

    if (!this.provider) return cancelActivation()

    try {
      const [chainId, accounts] = (await Promise.all([
        this.provider.request({ method: 'eth_chainId' }),
        this.provider.request({ method: 'eth_accounts' }),
      ])) as [string, string[]]

      return this.actions.update({
        chainId: this.parseChainId(chainId),
        accounts,
        accountIndex: accounts?.length ? 0 : undefined,
      })
    } catch (error) {
      return cancelActivation()
    }
  }

  /**
   * Initiates a connection and/or switches chain.
   *
   * @param desiredChainId - If defined, indicates the desired chain to connect to. If the user is
   * already connected to this chain, no additional steps will be taken. Otherwise, the user will be prompted to switch
   * to the chain.
   */
  public async activate(desiredChainId?: number): Promise<Web3ReactState> {
    const cancelActivation = this.provider?.isConnected?.() ? null : this.actions.startActivation()
    await this.isomorphicInitialize()

    if (!this.portis || !this.provider) throw new NoPortisProviderError()

    try {
      const [chainId, accounts] = await Promise.all([
        this.provider.send('eth_chainId') as Promise<string>,
        this.provider.send('eth_accounts') as Promise<string[]>,
      ])

      const receivedChainId = this.parseChainId(chainId)

      // if there's no desired chain, or it's equal to the received, update
      if (!desiredChainId || receivedChainId === desiredChainId) {
        return this.actions.update({
          chainId: receivedChainId,
          accounts,
          accountIndex: accounts?.length ? 0 : undefined,
        })
      }

      const desiredNetwork = chainIdToNetwork[desiredChainId]

      if (desiredNetwork) {
        this.portis.changeNetwork(desiredNetwork, !!this.options?.options?.gasRelay)

        this.actions.update({
          chainId: desiredChainId,
          accounts,
          accountIndex: accounts ? 0 : undefined,
        })

        return this.activate(desiredChainId)
      } else {
        throw new Error(`Unsupported chain ID ${desiredChainId}`)
      }
    } catch (error) {
      cancelActivation?.()
      throw error
    }
  }

  /** {@inheritdoc Connector.deactivate} */
  public async deactivate(): Promise<void> {
    try {
      // Will NOT trigger onLogout()
      const success = await this.portis?.logout()

      if (success) {
        this.actions.resetState()

        this.portis?.onLogout(() => {
          return
        })
        this.portis?.onActiveWalletChanged(() => {
          return
        })
        this.portis?.onError(() => {
          return
        })
      } else {
        throw new Error(`Failed to deactivate Portis`)
      }
    } catch (error) {
      throw new Error(`Failed to deactivate Portis`)
    }
  }
}
