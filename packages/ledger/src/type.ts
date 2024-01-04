import { Actions, Provider } from '@web3-react/types'

export type LedgerProvider = Provider & EthereumProvider

export type EthereumRequestPayload = {
  method: string
  params?: unknown[] | object
}

export interface EthereumProvider {
  providers?: EthereumProvider[]
  connector?: unknown
  accounts: string[]
  session?: any
  chainId: string | number
  request<T = unknown>(args: EthereumRequestPayload): Promise<T>
  disconnect?: { (): Promise<void> }
  on(event: any, listener: any): void
  removeListener(event: string, listener: any): void
}

/**
 * Options to configure the Ledger Connect Kit.
 */
export type LedgerOptions = {
  requiredEvents?: any
  requiredMethods?: any
  projectId: string
  chains: number[]
  optionalChains?: number[]
  methods?: string[]
  optionalMethods?: string[]
  events?: string[]
  optionalEvents?: string[]
  req?: any
  /**
   * Map of chainIds to rpc url(s). If multiple urls are provided, the first one that responds
   * within a given timeout will be used. Note that multiple urls are not supported by WalletConnect by default.
   * That's why we extend its options with our own `rpcMap` (@see getBestUrlMap).
   */
  rpcMap?: { [chainId: number]: string | string[] }
  relayUrl?: string
}

/**
 * Options to configure the WalletConnect connector.
 */
export interface LedgerConstructorArgs {
  actions: Actions
  /** Options to pass to `@walletconnect/ethereum-provider`. */
  options: LedgerOptions
  /** The chainId to connect to in activate if one is not provided. */
  defaultChainId?: number
  /**
   * @param timeout - Timeout, in milliseconds, after which to treat network calls to urls as failed when selecting
   * online urls.
   */
  timeout?: number
  /**
   * @param onError - Handler to report errors thrown from WalletConnect.
   */
  onError?: (error: Error) => void
}
