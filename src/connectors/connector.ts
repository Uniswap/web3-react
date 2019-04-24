import { ethers } from 'ethers'
import EventEmitter from 'events'

import { Web3ReactUpdateHandlerOptions } from '../manager'
import { Provider } from '../manager'

export interface ErrorCodes {
  [propName: string]: string
}

export interface ConnectorArguments {
  readonly supportedNetworks?: ReadonlyArray<number>
}

export function ErrorCodeMixin(Base: any, errorCodes: string[]): any {
  return class extends Base {
    public constructor(kwargs: any = {}) {
      super(kwargs)
    }

    public static get errorCodes(): ErrorCodes {
      return errorCodes.reduce((accumulator: ErrorCodes, currentValue: string): ErrorCodes => {
        accumulator[currentValue] = currentValue
        return accumulator
      }, {})
    }
  }
}

const ConnectorErrorCodes = ['UNSUPPORTED_NETWORK']
export default abstract class Connector extends ErrorCodeMixin(EventEmitter, ConnectorErrorCodes) {
  public readonly supportedNetworks: ReadonlyArray<number> | undefined

  public constructor(kwargs: ConnectorArguments = {}) {
    super()
    const { supportedNetworks } = kwargs
    this.supportedNetworks = supportedNetworks
  }

  public async onActivation(): Promise<void> {}
  public onDeactivation(_error: null | Error): void {} // eslint-disable-line @typescript-eslint/no-unused-vars

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

  // wraps emissions of _web3ReactUpdate
  protected _web3ReactUpdateHandler(options: Web3ReactUpdateHandlerOptions): void {
    this.emit('_web3ReactUpdate', options)
  }

  // wraps emissions of _web3ReactError
  protected _web3ReactErrorHandler(error: Error, preserveConnector: boolean = true): void {
    this.emit('_web3ReactError', error, preserveConnector)
  }

  // wraps emissions of _web3ReactError
  protected _web3ReactResetHandler(): void {
    this.emit('_web3ReactReset')
  }
}
