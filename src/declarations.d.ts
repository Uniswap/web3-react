declare module 'walletconnect'

interface Ethereum {
  enable: () => Promise<void>
  on: (eventName: string, listener: Function) => void
  removeListener: (eventName: string, listener: Function) => void
}

declare interface Window {
  ethereum: Ethereum
  web3: object
}

declare interface Error {
  code?: string | number | undefined
}
