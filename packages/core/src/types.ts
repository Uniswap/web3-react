import { AbstractConnector } from '@web3-react/abstract-connector'

export interface Web3ReactContext {
  connector?: AbstractConnector
  library?: any
  chainId?: number
  account?: null | string
  activate: (connector: AbstractConnector, onError?: (error: Error) => void) => Promise<void>
  setError: (error: Error) => void
  deactivate: () => void
  active: boolean
  error?: Error
}

export interface Web3ReactManagerReturn {
  connector?: AbstractConnector
  provider?: any
  chainId?: number
  account?: null | string
  activate: (connector: AbstractConnector) => Promise<void>
  setError: (error: Error) => void
  deactivate: () => void
  error?: Error
}
