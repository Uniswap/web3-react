import { EventEmitter } from 'events'

export interface AbstractConnectorArguments {
  readonly supportedChainIds?: ReadonlyArray<number>
}

export interface AbstractConnectorInterface extends EventEmitter {
  supportedChainIds?: ReadonlyArray<number>
  activate: () => Promise<ConnectorUpdate>
  getProvider: () => Promise<any>
  getChainId: (provider: any) => Promise<number>
  getAccount: (provider: any) => Promise<null | string>
  deactivate: () => void
}

export interface ConnectorUpdate {
  provider?: any
  chainId?: number
  account?: null | string
}

export enum ConnectorEvent {
  Update = 'Web3ReactUpdate',
  Error = 'Web3ReactError',
  Deactivate = 'Web3ReactDeactivate'
}
