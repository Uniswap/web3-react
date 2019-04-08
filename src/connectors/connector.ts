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

export function ErrorCodeMixin(Base: any, errorCodes: string[]): any {
  return class extends Base {
    public constructor(kwargs: any = {}) {
      super(kwargs)
    }

    public static get errorCodes(): IErrorCodes {
      return errorCodes.reduce((accumulator: IErrorCodes, currentValue: string): IErrorCodes => {
        accumulator[currentValue] = currentValue
        return accumulator
      }, {})
    }
  }
}

const ConnectorErrorCodes = ['UNSUPPORTED_NETWORK']
export default abstract class Connector extends ErrorCodeMixin(EventEmitter, ConnectorErrorCodes) {
  public readonly supportedNetworks: ReadonlyArray<number> | undefined

  public constructor(kwargs: IConnectorArguments = {}) {
    super()
    const { supportedNetworks } = kwargs
    this.supportedNetworks = supportedNetworks
  }

  public async onActivation(): Promise<void> {} // tslint:disable-line:no-empty
  public onDeactivation(): void {} // tslint:disable-line:no-empty

  public abstract async getProvider(networkId?: number): Promise<Provider>

  public async getNetworkId(provider: Provider): Promise<number> {
    const library = new ethers.providers.Web3Provider(provider)
    const networkId = await library.getNetwork().then((network): number => network.chainId)
    return this._validateNetworkId(networkId)
  }

  public async getAccount(provider: Provider): Promise<string | null> {
    const library = new ethers.providers.Web3Provider(provider)
    const account = await library.listAccounts().then((accounts): string | null => accounts[0] || null)
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
  protected _web3ReactUpdateNetworkIdHandler(networkId?: number, bypassCheck?: boolean): void {
    this.emit('_web3ReactUpdateNetworkId', networkId, bypassCheck)
  }

  // wraps emissions of _web3ReactUpdateAccount
  protected _web3ReactUpdateAccountHandler(account?: string, bypassCheck?: boolean): void {
    this.emit('_web3ReactUpdateAccount', account, bypassCheck)
  }

  // wraps emissions of _web3ReactUpdateNetworkIdAndAccount
  protected _web3ReactUpdateNetworkIdAndAccountHandler(
    networkId: number,
    bypassNetworkIdCheck?: boolean,
    account?: string,
    bypassAccountCheck?: boolean
  ): void {
    this.emit('_web3ReactUpdateNetworkIdAndAccount', networkId, bypassNetworkIdCheck, account, bypassAccountCheck)
  }

  // wraps emissions of _web3ReactError
  protected _web3ReactErrorHandler(error: Error): void {
    this.emit('_web3ReactError', error)
  }

  // wraps emissions of _web3ReactError
  protected _web3ReactResetHandler(): void {
    this.emit('_web3ReactReset')
  }
}
