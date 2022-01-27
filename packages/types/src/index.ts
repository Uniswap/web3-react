import type { EventEmitter } from 'node:events'
import type { State, StoreApi } from 'zustand/vanilla'

export interface Web3ReactState extends State {
  chainId: number | undefined
  accounts: string[] | undefined
  activating: boolean
  error: Error | undefined
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
  reportError: (error: Error | undefined) => void
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

export abstract class Connector {
  /**
   * An
   * EIP-1193 ({@link https://github.com/ethereum/EIPs/blob/master/EIPS/eip-1193.md}) and
   * EIP-1102 ({@link https://github.com/ethereum/EIPs/blob/master/EIPS/eip-1102.md}) compliant provider.
   * This property must be defined while the connector is active.
   */
  public provider: Provider | undefined

  protected readonly actions: Actions

  /**
   * @param actions - Methods bound to a zustand store that tracks the state of the connector.
   * Actions are used by the connector to report changes in connection status.
   */
  constructor(actions: Actions) {
    this.actions = actions
  }

  /**
   * Initiate a connection.
   */
  public abstract activate(...args: unknown[]): Promise<void> | void

  /**
   * Initiate a disconnect.
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public deactivate(...args: unknown[]): Promise<void> | void {
    this.actions.reportError(undefined)
  }
}
