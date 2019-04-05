declare module 'fortmatic'
declare module 'trezor-connect'
declare module 'ethereumjs-tx' // TODO change when TrezorSubprovider subprovider officially gets added to 0x/subproviders
declare module 'lodash' // TODO change when TrezorSubprovider officially gets added to 0x/subproviders

// tslint:disable-next-line: interface-name
interface Ethereum {
  autoRefreshOnNetworkChange?: boolean
  enable: () => Promise<void>
  on: (eventName: string, listener: Function) => void // tslint:disable-line: ban-types
  removeListener: (eventName: string, listener: Function) => void // tslint:disable-line: ban-types
  send(payload: any): void
  sendAsync(payload: any, callback: any): void
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
