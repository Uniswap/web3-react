import type { EventEmitter } from 'node:events'
import type { State, StoreApi } from 'zustand'

export type AddingChainInfo = {
  chainId: number
}

export type SwitchingChainInfo = {
  fromChainId?: number
  toChainId: number
}

export interface Web3ReactState extends State {
  chainId: number | undefined
  accounts: string[] | undefined
  accountIndex: number | undefined
  activating: boolean
  addingChain: AddingChainInfo | undefined
  switchingChain: SwitchingChainInfo | undefined
  watchingAsset: WatchAssetParameters | undefined
}

export type Web3ReactStore = StoreApi<Web3ReactState>

export type Web3ReactStateUpdate =
  // chainId
  | {
      chainId: number
      accounts?: never
      accountIndex?: never
      addingChain?: never
      switchingChain?: never
      watchingAsset?: never
    }
  // accounts
  | {
      chainId?: never
      accounts: string[]
      accountIndex?: never
      addingChain?: never
      switchingChain?: never
      watchingAsset?: never
    }
  // chainId, accounts
  | {
      chainId: number
      accounts: string[]
      accountIndex?: never
      addingChain?: never
      switchingChain?: never
      watchingAsset?: never
    }
  // accounts, accountIndex
  | {
      chainId?: never
      accounts?: string[]
      accountIndex: number | undefined
      addingChain?: never
      switchingChain?: never
      watchingAsset?: never
    }
  // chainId, accounts, accountIndex
  | {
      chainId: number
      accounts?: string[]
      accountIndex: number | undefined
      addingChain?: never
      switchingChain?: never
      watchingAsset?: never
    }
  // addingChain
  | {
      chainId?: never
      accounts?: never
      accountIndex?: never
      addingChain: AddingChainInfo | undefined
      switchingChain?: never
      watchingAsset?: never
    }
  // switchingChain
  | {
      chainId?: never
      accounts?: never
      accountIndex?: never
      addingChain?: never
      switchingChain: SwitchingChainInfo | undefined
      watchingAsset?: never
    }
  // addingChain, switchingChain
  | {
      chainId?: never
      accounts?: never
      accountIndex?: never
      addingChain: AddingChainInfo | undefined
      switchingChain: SwitchingChainInfo | undefined
      watchingAsset?: never
    }
  // watchingAsset
  | {
      chainId?: never
      accounts?: never
      accountIndex?: never
      addingChain?: never
      switchingChain?: never
      watchingAsset: WatchAssetParameters | undefined
    }

export interface Actions {
  startActivation: () => () => void
  update: (stateUpdate: Web3ReactStateUpdate) => void
  resetState: () => void
}

export interface ConnectorOptions {
  supportedChainIds?: number[]
  isBlockNumberEnabled?: boolean
  chainParameters?: AddEthereumChainParameters
}

export interface ConnectorArgs {
  actions: Actions
  onError?: (error: Error) => void
  connectorOptions?: ConnectorOptions
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

// per EIP-2255
export type PermissionCaveat = { type: string; value: string[] }

// per EIP-2255
export interface Web3WalletPermission {
  caveats?: PermissionCaveat[]
  date?: number
  id?: string
  invoker?: string
  parentCapability: string
}

// per EIP-3085
export interface AddEthereumChainParameter {
  chainId: number
  chainName: string
  nativeCurrency: {
    name: string
    symbol: string // 2-6 characters long
    decimals: number | 18
  }
  rpcUrls: string[]
  blockExplorerUrls?: string[]
  iconUrls?: string[]
}

export type AddEthereumChainParameters = { [chainId: number]: AddEthereumChainParameter }

// per EIP-747
export interface WatchAssetParameters {
  desiredChainIdOrChainParameters?: number | AddEthereumChainParameter
  type?: string
  address: string // The address that the token is at.
  symbol: string // A ticker symbol or shorthand, up to 5 chars.
  decimals: number | 18 // The number of decimals in the token
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

  /**
   * Optional way of providing the connector with chain parameters.
   * No need to pass "AddEthereumChainParameter" to "activate" if this options is provided.
   */
  public chainParameters?: AddEthereumChainParameters

  /**
   * Chains supported by the connector
   */
  public readonly supportedChainIds?: number[]

  /**
   * Actions to interact with the zustand store
   */
  protected readonly actions: Actions

  /**
   * Wether the listener is on
   */
  public disableWatcher = true

  /**
   * Wether the listener running
   */
  public watchingBlocks = false

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
  constructor(actions: Actions, onError?: (error: Error) => void, connectorOptions?: ConnectorOptions) {
    this.actions = actions
    this.onError = onError

    this.supportedChainIds = connectorOptions?.supportedChainIds
    this.disableWatcher = !connectorOptions?.isBlockNumberEnabled
    this.chainParameters = connectorOptions?.chainParameters
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

  /**
   * Helper to convert hex to decimal format
   */
  public parseChainId(chainIdHex: string | number): number {
    return typeof chainIdHex === 'number'
      ? chainIdHex
      : Number.parseInt(chainIdHex, chainIdHex.startsWith('0x') ? 16 : 10)
  }

  /**
   * Helper to convert decimal to hex format
   */
  public formatChainId(chainId: string | number): string {
    return `0x${chainId.toString(16)}`
  }
}
