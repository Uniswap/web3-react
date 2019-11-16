import { ConnectorUpdate } from '@web3-react/types'
import { AbstractConnector } from '@web3-react/abstract-connector'
import Web3ProviderEngine from 'web3-provider-engine'
import { RPCSubprovider } from '@0x/subproviders/lib/src/subproviders/rpc_subprovider' // https://github.com/0xProject/0x-monorepo/issues/1400
import invariant from 'tiny-invariant'

export interface NetworkConnectorArguments {
  urls: { [chainId: number]: string }
  defaultChainId?: number
  pollingInterval?: number
  requestTimeoutMs?: number
}

export class NetworkConnector extends AbstractConnector {
  private readonly urls: { [chainId: number]: string }
  private currentChainId: number
  private readonly pollingInterval?: number
  private readonly requestTimeoutMs?: number

  private provider: any

  constructor({ urls, defaultChainId, pollingInterval, requestTimeoutMs }: NetworkConnectorArguments) {
    invariant(defaultChainId || Object.keys(urls).length === 1, 'defaultChainId is a required argument with >1 url')
    super({ supportedChainIds: Object.keys(urls).map((k): number => Number(k)) })

    this.urls = urls
    this.currentChainId = defaultChainId || Number(Object.keys(urls)[0])
    this.pollingInterval = pollingInterval
    this.requestTimeoutMs = requestTimeoutMs
  }

  public async activate(): Promise<ConnectorUpdate> {
    this.provider = new Web3ProviderEngine({ pollingInterval: this.pollingInterval })
    this.provider.addProvider(new RPCSubprovider(this.urls[this.currentChainId], this.requestTimeoutMs))
    this.provider.start()
    return { provider: this.provider, account: null }
  }

  public async getProvider(): Promise<Web3ProviderEngine> {
    return this.provider
  }

  public async getChainId(): Promise<number> {
    return this.currentChainId
  }

  public async getAccount(): Promise<null> {
    return null
  }

  public deactivate() {
    this.provider = undefined
  }

  public changeChainId(chainId: number) {
    invariant(Object.keys(this.urls).includes(chainId.toString()), `No url found for chainId ${chainId}`)
    this.currentChainId = chainId
    // the below works, but there are other ways of structuring this process
    this.provider.stop()
    this.provider = new Web3ProviderEngine({ pollingInterval: this.pollingInterval })
    this.provider.addProvider(new RPCSubprovider(this.urls[this.currentChainId], this.requestTimeoutMs))
    this.provider.start()
    this.emitUpdate({ provider: this.provider, chainId })
  }
}
