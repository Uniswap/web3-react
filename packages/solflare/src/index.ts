import type { SendOptions, Transaction } from '@solana/web3.js'
import { Connection, PublicKey } from '@solana/web3.js'
import type { ConnectorArgs, Provider, ProviderRpcError } from '@web3-react/types'
import { Connector, Web3ReactState } from '@web3-react/types'

declare global {
  interface Window {
    solflare?: SolflareProvider
  }
}

export type ChainType = 'mainnet' | 'devnet' | 'testnet'
export type DisplayEncoding = 'utf8' | 'hex'
export type SolflareEvent = 'connect' | 'disconnect' | 'accountChanged'
export type SolflareRequestMethod =
  | 'connect'
  | 'disconnect'
  | 'signAndSendTransaction'
  | 'signTransaction'
  | 'signAllTransactions'
  | 'signMessage'

export type SolflareProvider = Provider & {
  isSolflare?: boolean
  isConnected?: boolean
  publicKey?: PublicKey
  openBridge?: () => void
  signAndSendTransaction: (
    transaction: Transaction,
    opts?: SendOptions
  ) => Promise<{ signature: string; publicKey: PublicKey }>
  signTransaction: (transaction: Transaction) => Promise<Transaction>
  signAllTransactions: (transactions: Transaction[]) => Promise<Transaction[]>
  signMessage: (message: Uint8Array | string, display?: DisplayEncoding) => Promise<unknown>
  connect: () => Promise<boolean>
  disconnect: () => Promise<void>
  on: (event: SolflareEvent, handler: (args: unknown) => void) => void
  request: (method: SolflareRequestMethod, params: unknown) => Promise<unknown>
}

type SolflareWalletOptions = {
  defaultChain: ChainType
  checkNetworkInterval: number
}

export const mainChainId = 1399811149
export const devChainId = 1399811150
export const testChainId = 1399811151

const getEndpointForChain = (chain: ChainType): string => {
  if (chain === 'devnet') return 'https://rpc.ankr.com/solana_devnet'
  if (chain === 'testnet') return 'https://api.testnet.solana.com'

  return 'https://rpc.ankr.com/solana'
}

export class NoSolflareProviderError extends Error {
  public constructor() {
    super('Solflare Wallet not installed')
    this.name = NoSolflareProviderError.name
    Object.setPrototypeOf(this, NoSolflareProviderError.prototype)
  }
}

/**
 * @param options - Options to pass to the "Solflare" provider.
 * @param onError - Handler to report errors thrown from eventListeners.
 */
export interface SolflareConstructorArgs extends ConnectorArgs {
  options?: SolflareWalletOptions
}

export class SolflareWallet extends Connector {
  /** {@inheritdoc Connector.provider} */
  public readonly provider: undefined
  /** {@inheritdoc Connector.customProvider} */
  public customProvider?: SolflareProvider

  public connection?: Connection

  // private chainInterval?: unknown
  private readonly options?: SolflareWalletOptions

  constructor({ actions, options, onError, connectorOptions }: SolflareConstructorArgs) {
    super(actions, onError, {
      ...connectorOptions,
      supportedChainIds: connectorOptions?.supportedChainIds ?? [mainChainId, devChainId, testChainId],
    })
    this.options = options
    this.connection = new Connection(getEndpointForChain(this?.options?.defaultChain ?? 'devnet'))
  }

  public getChainId() {
    if (!this.connection) return undefined

    if (this.connection.rpcEndpoint.includes('mainnet')) {
      return mainChainId
    } else if (this.connection.rpcEndpoint.includes('devnet')) {
      return devChainId
    } else if (this.connection.rpcEndpoint.includes('testnet')) {
      return testChainId
    }
  }

  validateAccount(address: string | PublicKey): string {
    const pubKey = typeof address === 'string' ? new PublicKey(address) : address

    if (PublicKey.isOnCurve(pubKey)) return pubKey.toBase58()

    throw new Error('Invalid address')
  }

  private isomorphicInitialize() {
    if (this.customProvider) return

    const provider = window?.solflare as SolflareProvider

    if (provider) {
      this.customProvider = provider

      this.customProvider.on('connect', (publicKey: PublicKey | null): void => {
        if (!publicKey) return

        const account = this.validateAccount(publicKey)
        if (account) {
          this.actions.update(
            {
              chainId: this.getChainId(),
              accounts: [account],
              accountIndex: account ? 0 : undefined,
            },
            true // Skip validation checks
          )
        } else {
          throw new Error('No accounts returned')
        }
      })

      this.customProvider.on('disconnect', (error: ProviderRpcError): void => {
        this.actions.resetState()
        this.onError?.(error)
      })

      this.customProvider.on('accountChanged', (publicKey: PublicKey | null): void => {
        if (!publicKey) {
          this.actions.resetState()
          return
        }

        const account = this.validateAccount(publicKey)

        if (!account) {
          this.actions.resetState()
        } else {
          this.actions.update(
            { accounts: [account], accountIndex: account ? 0 : undefined },
            true // Skip validation checks
          )
        }
      })
    }
  }

  /** {@inheritdoc Connector.connectEagerly} */
  public async connectEagerly(): Promise<Web3ReactState> {
    this.isomorphicInitialize()

    const cancelActivation =
      this.customProvider?.isConnected || !this.customProvider ? null : this.actions.startActivation()

    if (!this.customProvider?.connect) return cancelActivation?.() ?? this.actions.getState()

    return this.customProvider
      .connect()
      .then((success) => {
        if (!success) {
          console.debug('Could not connect eagerly')
          return cancelActivation?.() ?? this.actions.getState()
        }

        return this.actions.getState()
      })
      .catch((error: ProviderRpcError) => {
        console.debug('Could not connect eagerly', error)
        return cancelActivation?.() ?? this.actions.getState()
      })
  }

  /**
   * Initiates a connection.
   */
  public async activate(desiredChainId?: number): Promise<Web3ReactState> {
    if (desiredChainId) {
      const chain = desiredChainId === mainChainId ? 'mainnet' : desiredChainId === devChainId ? 'devnet' : 'testnet'
      this.connection = new Connection(getEndpointForChain(chain ?? 'mainnet'))

      this.actions.update({ chainId: desiredChainId })
    }

    this.isomorphicInitialize()

    const cancelActivation =
      !this.customProvider || this.customProvider?.isConnected ? null : this.actions.startActivation()

    if (!this.customProvider?.connect) throw new NoSolflareProviderError()

    return this.customProvider
      .connect()
      .then((success: boolean) => {
        if (!success) {
          console.debug('Could not connect eagerly')
          return cancelActivation?.() ?? this.actions.getState()
        }

        return this.actions.getState()
      })
      .catch((error: ProviderRpcError) => {
        console.debug('Could not connect', error)
        cancelActivation?.()
        throw error
      })
  }
}
