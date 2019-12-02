import { ConnectorUpdate } from '@web3-react/types'
import { AbstractConnector } from '@web3-react/abstract-connector'
import Web3ProviderEngine from 'web3-provider-engine'
import { RPCSubprovider } from '@0x/subproviders/lib/src/subproviders/rpc_subprovider' // https://github.com/0xProject/0x-monorepo/issues/1400
import invariant from 'tiny-invariant'

interface NetworkConnectorArguments {
  urls: { [chainId: number]: string }
  defaultChainId?: number
  pollingInterval?: number
  requestTimeoutMs?: number
}

export class NetworkConnector extends AbstractConnector {
  private readonly providers: { [chainId: number]: any }
  private currentChainId: number
  private readonly pollingInterval?: number
  private readonly requestTimeoutMs?: number
  private active: boolean

  constructor({ urls, defaultChainId, pollingInterval, requestTimeoutMs }: NetworkConnectorArguments) {
    invariant(defaultChainId || Object.keys(urls).length === 1, 'defaultChainId is a required argument with >1 url')
    super({ supportedChainIds: Object.keys(urls).map((k): number => Number(k)) })

    this.providers = Object.keys(urls).reduce((accumulator, chainId) => {
      const engine = new Web3ProviderEngine({ pollingInterval: this.pollingInterval })
      engine.addProvider(new RPCSubprovider(urls[Number(chainId)], this.requestTimeoutMs))
      return Object.assign(accumulator, { [Number(chainId)]: engine })
    }, {})
    this.currentChainId = defaultChainId || Number(Object.keys(urls)[0])
    this.pollingInterval = pollingInterval
    this.requestTimeoutMs = requestTimeoutMs
    this.active = false
  }

  public async activate(): Promise<ConnectorUpdate> {
    this.providers[this.currentChainId].start()
    this.active = true
    return { provider: this.providers[this.currentChainId], chainId: this.currentChainId, account: null }
  }

  public async getProvider(): Promise<Web3ProviderEngine> {
    return this.providers[this.currentChainId]
  }

  public async getChainId(): Promise<number> {
    return this.currentChainId
  }

  public async getAccount(): Promise<null> {
    return null
  }

  public deactivate() {
    this.providers[this.currentChainId].stop()
    this.active = false
  }

  public changeChainId(chainId: number) {
    invariant(Object.keys(this.providers).includes(chainId.toString()), `No url found for chainId ${chainId}`)
    if (this.active) {
      this.providers[this.currentChainId].stop()
      this.currentChainId = chainId
      this.providers[this.currentChainId].start()
      this.emitUpdate({ provider: this.providers[this.currentChainId], chainId })
    } else {
      this.currentChainId = chainId
    }
  }
}
