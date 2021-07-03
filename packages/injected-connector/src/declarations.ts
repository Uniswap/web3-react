interface Ethereum {
  request: (args: RequestArguments) => Promise<unknown>
  enable: () => Promise<string[]>
  on?: (method: string, listener: (...args: any[]) => void) => void
  removeListener?: (method: string, listener: (...args: any[]) => void) => void
  isMetaMask: boolean
  chainId: any
  netVersion: any
  networkVersion: any
  _chainId: any
  autoRefreshOnNetworkChange: boolean
}

export interface RequestArguments {
    method: string;
    params?: unknown[] | object;
}

declare interface Window {
  ethereum?: Ethereum
}

declare const __DEV__: boolean
