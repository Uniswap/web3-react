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

export interface AbstractConnectorArguments {
  readonly supportedChainIds?: ReadonlyArray<number>
}
