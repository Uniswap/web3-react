import type { EventEmitter } from 'node:events'
import type { State, StoreApi } from 'zustand'

export interface Web3ReactState extends State {
  chainId: number | undefined
  accounts: string[] | undefined
  activating: boolean
}

export type Web3ReactStore = StoreApi<Web3ReactState>

export type Web3ReactStateUpdate =
  | {
      chainId: number
      accounts: string[]
    }
  | {
      chainId: number
      accounts?: never
    }
  | {
      chainId?: never
      accounts: string[]
    }

export interface Actions {
  startActivation: () => () => void
  update: (stateUpdate: Web3ReactStateUpdate) => void
  resetState: () => void
}

// per EIP-1193
export interface RequestArguments {
  readonly method: string
  readonly params?: readonly unknown[] | object
}

// per EIP-1193
export interface Provider extends EventEmitter {
  request(args: RequestArguments): Promise<unknown>
}

// per EIP-1193
export interface ProviderConnectInfo {
  readonly chainId: string
}

// per EIP-1193
export interface ProviderRpcError extends Error {
  message: string
  code: number
  data?: unknown
}

// per EIP-3085
export interface AddEthereumChainParameter {
  chainId: number
  chainName: string
  nativeCurrency: {
    name: string
    symbol: string // 2-6 characters long
    decimals: 18
  }
  rpcUrls: string[]
  blockExplorerUrls?: string[]
  iconUrls?: string[] // Currently ignored.
}

// per EIP-747
export interface WatchAssetParameters {
  address: string // The address that the token is at.
  symbol: string // A ticker symbol or shorthand, up to 5 chars.
  decimals: number // The number of decimals in the token
  image: string // A string url of the token logo
}

export abstract class Connector {
  /**
   * An
   * EIP-1193 ({@link https://github.com/ethereum/EIPs/blob/master/EIPS/eip-1193.md}) and
   * EIP-1102 ({@link https://github.com/ethereum/EIPs/blob/master/EIPS/eip-1102.md}) compliant provider.
   * May also comply with EIP-3085 ({@link https://github.com/ethereum/EIPs/blob/master/EIPS/eip-3085.md}).
   * This property must be defined while the connector is active, unless a customProvider is provided.
   */
  public provider?: Provider

  /**
   * An optional property meant to allow ethers providers to be used directly rather than via the experimental
   * 1193 bridge. If desired, this property must be defined while the connector is active, in which case it will
   * be preferred over provider.
   */
  public customProvider?: unknown

  protected readonly actions: Actions

  /**
   * An optional handler which will report errors thrown from event listeners. Any errors caused from
   * user-defined behavior will be thrown inline through a Promise.
   */
  protected onError?: (error: Error) => void

  /**
   * @param actions - Methods bound to a zustand store that tracks the state of the connector.
   * @param onError - An optional handler which will report errors thrown from event listeners.
   * Actions are used by the connector to report changes in connection status.
   */
  constructor(actions: Actions, onError?: (error: Error) => void) {
    this.actions = actions
    this.onError = onError
  }

  /**
   * Reset the state of the connector without otherwise interacting with the connection.
   */
  public resetState(): Promise<void> | void {
    this.actions.resetState()
  }

  /**
   * Initiate a connection.
   */
  public abstract activate(...args: unknown[]): Promise<void> | void

  /**
   * Attempt to initiate a connection, failing silently
   */
  public connectEagerly?(...args: unknown[]): Promise<void> | void

  /**
   * Un-initiate a connection. Only needs to be defined if a connection requires specific logic on disconnect.
   */
  public deactivate?(...args: unknown[]): Promise<void> | void

  /**
   * Attempt to add an asset per EIP-747.
   */
  public watchAsset?(params: WatchAssetParameters): Promise<true>
}
