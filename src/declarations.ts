declare module 'walletconnect-web3-subprovider'
declare module 'web3-provider-engine/subproviders/rpc'

// tslint:disable-next-line: interface-name
interface Ethereum {
  enable: () => Promise<void>
  on: (eventName: string, listener: Function) => void // tslint:disable-line: ban-types
  removeListener: (eventName: string, listener: Function) => void // tslint:disable-line: ban-types
}

// tslint:disable-next-line: interface-name
declare interface Window {
  ethereum: Ethereum
  web3: object
}

// tslint:disable-next-line: interface-name
declare interface Error {
  code?: string | number | undefined
}
