import EventEmitter from 'events'
import { AbstractConnectorArguments, ConnectorUpdate, ConnectorEvent } from '@web3-react/types'

export class UnsupportedChainIdError extends Error {
  public constructor(unsupportedChainId: number, supportedChainIds?: readonly number[]) {
    super()
    this.name = this.constructor.name
    this.message = `Unsupported chain id: ${unsupportedChainId}. Supported chain ids are: ${supportedChainIds}.`
  }
}

export abstract class AbstractConnector extends EventEmitter {
  public readonly supportedChainIds: undefined | ReadonlyArray<number>

  constructor({ supportedChainIds }: AbstractConnectorArguments = {}) {
    super()
    this.supportedChainIds = supportedChainIds
    this.emitUpdate = this.emitUpdate.bind(this)
    this.emitError = this.emitError.bind(this)
    this.emitDeactivate = this.emitDeactivate.bind(this)
  }

  public abstract async activate(): Promise<ConnectorUpdate>
  public abstract async getProvider(): Promise<any>
  public abstract async getChainId(provider: any): Promise<number>
  public abstract async getAccount(provider: any): Promise<null | string>
  public abstract deactivate(): void

  protected validateChainId(chainId: number) {
    if (!!this.supportedChainIds && !this.supportedChainIds.includes(chainId)) {
      throw new UnsupportedChainIdError(chainId, this.supportedChainIds)
    }
  }

  protected emitUpdate(update: ConnectorUpdate): void {
    if (__DEV__) {
      console.log(`Emitting ${ConnectorEvent.Update} with payload`, update)
    }
    this.emit(ConnectorEvent.Update, update)
  }

  protected emitError(error: Error): void {
    if (__DEV__) {
      console.log(`Emitting ${ConnectorEvent.Error} with payload`, error)
    }
    this.emit(ConnectorEvent.Error, error)
  }

  protected emitDeactivate(): void {
    if (__DEV__) {
      console.log(`Emitting ${ConnectorEvent.Deactivate}`)
    }
    this.emit(ConnectorEvent.Deactivate)
  }
}
