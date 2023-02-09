import { BigNumber } from '@ethersproject/bignumber'
import type { SendOptions, Transaction } from '@solana/web3.js'
import { Connection, PublicKey } from '@solana/web3.js'
import type { ConnectorArgs, Provider, ProviderRpcError, Web3ReactState } from '@web3-react/types'
import { Connector } from '@web3-react/types'

declare global {
  interface Window {
    phantom?: { solana?: PhantomProvider }
  }
}

export type ChainType = 'mainnet' | 'devnet' | 'testnet'

interface ConnectOpts {
  onlyIfTrusted: boolean
}

export type DisplayEncoding = 'utf8' | 'hex'

export type PhantomEvent = 'connect' | 'disconnect' | 'accountChanged'

export type PhantomRequestMethod =
  | 'connect'
  | 'disconnect'
  | 'signAndSendTransaction'
  | 'signTransaction'
  | 'signAllTransactions'
  | 'signMessage'

export type PhantomProvider = Provider & {
  isPhantom?: boolean
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
  connect: (options?: Partial<ConnectOpts>) => Promise<{ publicKey: PublicKey }>
  disconnect: () => Promise<void>
  on: (event: PhantomEvent, handler: (args: unknown) => void) => void
  request: (method: PhantomRequestMethod, params: unknown) => Promise<unknown>
  getBalance: (address: string) => Promise<BigNumber>
  getBlockNumber: () => Promise<number>
}

type PhantomWalletOptions = {
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

export class NoPhantomProviderError extends Error {
  public constructor() {
    super('Phantom Wallet not installed')
    this.name = NoPhantomProviderError.name
    Object.setPrototypeOf(this, NoPhantomProviderError.prototype)
  }
}

/**
 * @param options - Options to pass to the "Phantom" provider.
 * @param onError - Handler to report errors thrown from eventListeners.
 */
export interface PhantomConstructorArgs extends ConnectorArgs {
  options?: PhantomWalletOptions
}

export class PhantomWallet extends Connector {
  /** {@inheritdoc Connector.provider} */
  public readonly provider: undefined
  /** {@inheritdoc Connector.customProvider} */
  public customProvider?: PhantomProvider

  public connection?: Connection

  private readonly options?: PhantomWalletOptions

  constructor({ actions, options, onError, connectorOptions }: PhantomConstructorArgs) {
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

    const provider = window?.phantom?.solana as PhantomProvider

    if (provider) {
      this.customProvider = provider

      this.customProvider.getBalance = async (address: string | PublicKey | undefined) => {
        if (!this.customProvider?.publicKey && !address) return BigNumber.from(0)

        const pubKey =
          this.customProvider?.publicKey ?? (address && typeof address === 'string')
            ? new PublicKey(address as string)
            : (address as PublicKey)

        if (!pubKey) return BigNumber.from(0)

        const balance = await this.connection?.getBalance(pubKey)

        return BigNumber.from(balance)
      }

      this.customProvider.getBlockNumber = async () => {
        if (!this.connection?.getBlockHeight) return 0
        return await this.connection.getBlockHeight()
      }

      // this.customProvider.on('connect', (publicKey: PublicKey | null): void => {})

      this.customProvider.on('disconnect', (error: ProviderRpcError): void => {
        this.actions.resetState()
        this.onError?.(error)
      })

      this.customProvider.on('accountChanged', (publicKey: PublicKey | null): void => {
        if (!publicKey) {
          this.actions.resetState()
          return
        }

        // Validate the account since we will be skipping validation checks
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

    if (!this.customProvider || !this.customProvider?.connect) return this.actions.getState()

    const cancelActivation = this.customProvider?.isConnected ? null : this.actions.startActivation()

    return this.customProvider
      .connect({ onlyIfTrusted: true })
      .then(({ publicKey }: { publicKey: PublicKey | null }) => {
        if (!publicKey) return cancelActivation?.() ?? this.actions.getState()

        // Validate the account since we will be skipping validation checks
        const account = this.validateAccount(publicKey)

        if (account) {
          return this.actions.update(
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

    if (!this.customProvider?.connect) throw new NoPhantomProviderError()

    return this.customProvider
      .connect({ onlyIfTrusted: false })
      .then(({ publicKey }: { publicKey: PublicKey | null }) => {
        if (publicKey) {
          // Validate the account since we will be skipping validation checks
          const account = this.validateAccount(publicKey)

          return this.actions.update(
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
      .catch((error: ProviderRpcError) => {
        console.debug('Could not connect', error)
        return cancelActivation?.() ?? this.actions.getState()
      })
  }
}
