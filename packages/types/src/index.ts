import type { EventEmitter } from 'node:events'
import type { State, StoreApi } from 'zustand/vanilla'

export interface Web3ReactState extends State {
  chainId: number | undefined
  accounts: string[] | undefined
  activating: boolean
  error: Error | undefined
}

export type Web3ReactStore = StoreApi<Web3ReactState>

export interface Web3ReactStateUpdate {
  chainId?: number
  accounts?: string[]
}

export interface Actions {
  startActivation: () => () => void
  update: (stateUpdate: Web3ReactStateUpdate) => void
  reportError: (error: Error) => void
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

export abstract class Connector {
  public provider: Provider | undefined

  protected readonly actions: Actions

  constructor(actions: Actions) {
    this.actions = actions
  }

  public abstract activate(...args: any[]): Promise<void> | void
  public deactivate?(...args: any[]): Promise<void> | void
}
