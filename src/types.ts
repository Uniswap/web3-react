export type LibraryName = 'web3.js' | 'ethers.js' | null
export type Provider = any
export type Library = any

export interface IConnectors {
  [propName: string]: any
}

export interface IWeb3ContextInterface {
  active: boolean
  connectorName?: string
  connector?: any
  library?: Library
  networkId?: number
  account?: string | null
  error: Error | null

  setConnector: (connectorName: string, suppressAndThrowErrors?: boolean) => Promise<void>
  setFirstValidConnector: (connectorNames: string[], suppressAndThrowErrors?: boolean) => Promise<void>
  unsetConnector: () => void
  setError: (error: Error, connectorName?: string) => void
}
