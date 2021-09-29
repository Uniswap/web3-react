import { State, StoreApi } from 'zustand/vanilla'
import type { EventEmitter } from 'events'

export interface Web3ReactState extends State {
  chainId: number | undefined
  accounts: string[] | undefined
  activating: boolean
  error: Error | undefined
}

export type Web3ReactStore = StoreApi<Web3ReactState>

export interface Actions {
  startActivation: () => void
  update: (state: Partial<Pick<Web3ReactState, 'chainId' | 'accounts'>>) => void
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
  protected readonly actions: Actions
  public provider: Provider | undefined
  public deactivate?(): Promise<void>

  constructor(actions: Actions) {
    this.actions = actions
  }

  public abstract activate(): Promise<void>
}
