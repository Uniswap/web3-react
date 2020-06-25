import { ConnectorUpdate } from '@web3-react/types'
import { AbstractConnector } from '@web3-react/abstract-connector'
import provider from 'eth-provider'
import invariant from 'tiny-invariant'

interface NetworkConnectorArguments {
  urls: { [chainId: number]: string }
  defaultChainId?: number
}

export class NetworkConnector extends AbstractConnector {
  private readonly providers: { [chainId: number]: any }
  private currentChainId: number

  constructor({ urls, defaultChainId }: NetworkConnectorArguments) {
    invariant(defaultChainId || Object.keys(urls).length === 1, 'defaultChainId is a required argument with >1 url')
    super({ supportedChainIds: Object.keys(urls).map((k): number => Number(k)) })

    this.currentChainId = defaultChainId || Number(Object.keys(urls)[0])
    this.providers = Object.keys(urls).reduce<{ [chainId: number]: any }>((accumulator, chainId) => {
      accumulator[Number(chainId)] = provider([urls[Number(chainId)]])
      return accumulator
    }, {})
  }

  public async activate(): Promise<ConnectorUpdate> {
    return { provider: this.providers[this.currentChainId], chainId: this.currentChainId, account: null }
  }

  public async getProvider(): Promise<any> {
    return this.providers[this.currentChainId]
  }

  public async getChainId(): Promise<number> {
    return this.currentChainId
  }

  public async getAccount(): Promise<null> {
    return null
  }

  public deactivate() {
    return
  }

  public changeChainId(chainId: number) {
    invariant(Object.keys(this.providers).includes(chainId.toString()), `No url found for chainId ${chainId}`)
    this.currentChainId = chainId
    this.emitUpdate({ provider: this.providers[this.currentChainId], chainId })
  }
}
