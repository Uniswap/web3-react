interface Ethereum {
  send: (method: string, params?: any[]) => Promise<any>
  on: (method: string, listener: (...args: any[]) => void) => this
  removeListener: (method: string, listener: (...args: any[]) => void) => this
  isMetaMask?: boolean
}

declare interface Window {
  ethereum?: Ethereum
}

declare const __DEV__: boolean
