interface Ethereum {
  send: (method: string, params?: any[]) => Promise<any>
  enable: () => Promise<string[]>
  on?: (method: string, listener: (...args: any[]) => void) => this
  removeListener?: (method: string, listener: (...args: any[]) => void) => this
  isMetaMask?: boolean
  autoRefreshOnNetworkChange?: boolean

  chainId: number | string
  networkVersion: number | string
  _chainId: number | string
  netVersion: number | string
}

declare interface Window {
  ethereum?: Ethereum
}

declare const __DEV__: boolean
