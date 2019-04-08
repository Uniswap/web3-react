declare module 'fortmatic'
declare module 'trezor-connect'
declare module '@walletconnect/web3-subprovider' // TODO change when this package correctly ships types
declare module 'ethereumjs-tx' // TODO change when TrezorSubprovider subprovider officially gets added to 0x/subproviders
declare module 'lodash' // TODO change when TrezorSubprovider officially gets added to 0x/subproviders

interface Ethereum {
  autoRefreshOnNetworkChange?: boolean
  isMetaMask?: boolean
  enable: () => Promise<void>
  on?: (eventName: string, listener: Function) => void // tslint:disable-line: ban-types
  removeListener?: (eventName: string, listener: Function) => void // tslint:disable-line: ban-types
}

declare interface Window {
  ethereum?: Ethereum
  web3?: object
}

declare interface Error {
  code?: string | number | undefined
}
