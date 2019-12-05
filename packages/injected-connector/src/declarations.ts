interface Ethereum {
  send:
    | ((method: string, params?: any[]) => Promise<{ result: any }>)
    | ((payload: { method: string; params?: any[] }, callback: (error: Error, result: { result: any }) => void) => void)
  enable: () => Promise<string[]>
  on?: (method: string, listener: (...args: any[]) => void) => this
  removeListener?: (method: string, listener: (...args: any[]) => void) => this
}

declare interface Window {
  ethereum?: Ethereum
}

declare const __DEV__: boolean
