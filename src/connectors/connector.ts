// tslint:disable: max-classes-per-file
import { ethers } from 'ethers'
import EventEmitter from 'events'

import { Provider } from '../types'

export interface IErrorCodes {
  [propName: string]: string
}

export interface IConnectorArguments {
  readonly supportedNetworks?: ReadonlyArray<number>
}

export function ErrorCodeMixin(Base: any, errorCodes: string[]) {
  return class extends Base {
    constructor(kwargs: any = {}) {
      super(kwargs)
    }

    static get errorCodes(): IErrorCodes {
      return errorCodes.reduce((accumulator: IErrorCodes, currentValue: string) => {
        accumulator[currentValue] = currentValue
        return accumulator
      }, {})
    }
  }
}

const ConnectorErrorCodes = ['UNSUPPORTED_NETWORK']
export default abstract class Connector extends ErrorCodeMixin(EventEmitter, ConnectorErrorCodes) {
  public readonly supportedNetworks: ReadonlyArray<number> | undefined

  constructor(kwargs: IConnectorArguments = {}) {
    super()
    const { supportedNetworks } = kwargs
    this.supportedNetworks = supportedNetworks
  }

  public async onActivation(): Promise<void> {} // tslint:disable-line:no-empty
  public onDeactivation(): void {} // tslint:disable-line:no-empty

  public abstract async getProvider(networkId?: number): Promise<Provider>

  public async getNetworkId(provider: Provider): Promise<number> {
    const library = new ethers.providers.Web3Provider(provider)
    const networkId = await library.getNetwork().then(network => network.chainId)
    return this._validateNetworkId(networkId)
  }

  public async getAccount(provider: Provider): Promise<string | null> {
    const library = new ethers.providers.Web3Provider(provider)
    const account = await library.listAccounts().then(accounts => accounts[0] || null)
    return account
  }

  protected _validateNetworkId(networkId: number): number {
    if (this.supportedNetworks && !this.supportedNetworks.includes(networkId)) {
      const unsupportedNetworkError = Error(`Unsupported Network: ${networkId}.`)
      unsupportedNetworkError.code = Connector.errorCodes.UNSUPPORTED_NETWORK
      throw unsupportedNetworkError
    }

    return networkId
  }

  // wraps emissions of _web3ReactUpdateNetworkId
  protected _web3ReactUpdateNetworkIdHandler(networkId: number) {
    this.emit('_web3ReactUpdateNetworkId', networkId)
  }

  // wraps emissions of _web3ReactUpdateAccount
  protected _web3ReactUpdateAccountHandler(account: string) {
    this.emit('_web3ReactUpdateAccount', account)
  }

  // wraps emissions of _web3ReactUpdateNetworkIdAndAccount
  protected _web3ReactUpdateNetworkIdAndAccountHandler(networkId: number, account: string) {
    this.emit('_web3ReactUpdateNetworkIdAndAccount', networkId, account)
  }

  // wraps emissions of _web3ReactError
  protected _web3ReactErrorHandler(error: Error) {
    this.emit('_web3ReactError', error)
  }

  // wraps emissions of _web3ReactError
  protected _web3ReactResetHandler() {
    this.emit('_web3ReactReset')
  }
}
