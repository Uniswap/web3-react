import { AbstractConnectorInterface } from '@web3-react/types'

export interface Web3ReactManagerFunctions {
  activate: (
    connector: AbstractConnectorInterface,
    onError?: (error: Error) => void,
    throwErrors?: boolean
  ) => Promise<void>
  activateFirst: (
    connectors: AbstractConnectorInterface[],
    onError?: (error: Error) => void,
    throwErrors?: boolean
  ) => Promise<void>
  setError: (error: Error) => void
  deactivate: () => void
}

export interface Web3ReactManagerReturn extends Web3ReactManagerFunctions {
  connector?: AbstractConnectorInterface
  provider?: any
  chainId?: number
  account?: null | string

  error?: Error
}

export interface Web3ReactContextInterface extends Web3ReactManagerFunctions {
  connector?: AbstractConnectorInterface
  library?: any
  chainId?: number
  account?: null | string

  active: boolean
  error?: Error
}
