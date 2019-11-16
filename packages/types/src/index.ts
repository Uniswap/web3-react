import { EventEmitter } from 'events'

export interface AbstractConnectorArguments {
  readonly supportedChainIds?: ReadonlyArray<number>
}

export interface ConnectorUpdate<T = number | string> {
  provider?: any
  chainId?: T
  account?: null | string
}

export enum ConnectorEvent {
  Update = 'Web3ReactUpdate',
  Error = 'Web3ReactError',
  Deactivate = 'Web3ReactDeactivate'
}

export interface AbstractConnectorInterface extends EventEmitter {
  supportedChainIds?: ReadonlyArray<number>

  activate: () => Promise<ConnectorUpdate>
  getProvider: () => Promise<any>
  getChainId: () => Promise<number | string>
  getAccount: () => Promise<null | string>
  deactivate: () => void
}
