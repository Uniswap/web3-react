import { ConnectorUpdate } from '@web3-react/types'
import { AbstractConnector } from '@web3-react/abstract-connector'
import invariant from 'tiny-invariant'

interface NetworkConnectorArguments {
  urls: { [chainId: number]: string }
  defaultChainId?: number
}

// taken from ethers.js, compatible interface with web3 provider
type AsyncSendable = {
  isMetaMask?: boolean;
  host?: string;
  path?: string;
  sendAsync?: (request: any, callback: (error: any, response: any) => void) => void;
  send?: (request: any, callback: (error: any, response: any) => void) => void;
}

class MiniRpcProvider implements AsyncSendable {
  public readonly isMetaMask: false = false
  public readonly chainId: number
  public readonly url: string
  public readonly host: string
  public readonly path: string

  constructor(chainId: number, url: string) {
    this.chainId = chainId
    this.url = url
    const parsed = new URL(url)
    this.host = parsed.host
    this.path = parsed.pathname
  }

  sendAsync(request: any, callback: (error: any, response: any) => void): void {
    fetch(this.url, {
      method: 'POST',
      body: JSON.stringify(request)
    })
      .then(
        result => {
          return result.json()
            .then(
              json => {
                if (!result.ok) {
                  throw new Error(`${json.code}: ${json.message}`)
                }
                return json
              }
            )
        }
      )
      .then(
        json => {
          callback(undefined, json)
        }
      )
      .catch(
        error => {
          callback(error, undefined)
        }
      )
  }
}

export class NetworkConnector extends AbstractConnector {
  private readonly providers: { [chainId: number]: MiniRpcProvider }
  private currentChainId: number
  private active: boolean

  constructor({ urls, defaultChainId }: NetworkConnectorArguments) {
    invariant(defaultChainId || Object.keys(urls).length === 1, 'defaultChainId is a required argument with >1 url')
    super({ supportedChainIds: Object.keys(urls).map((k): number => Number(k)) })

    this.currentChainId = defaultChainId || Number(Object.keys(urls)[0])
    this.providers = Object.keys(urls).reduce<{ [chainId: number]: MiniRpcProvider }>((accumulator, chainId) => {
      accumulator[Number(chainId)] = new MiniRpcProvider(Number(chainId), urls[Number(chainId)])
      return accumulator
    }, {})
    this.active = false
  }

  public async activate(): Promise<ConnectorUpdate> {
    this.active = true
    return { provider: this.providers[this.currentChainId], chainId: this.currentChainId, account: null }
  }

  public async getProvider(): Promise<MiniRpcProvider> {
    return this.providers[this.currentChainId]
  }

  public async getChainId(): Promise<number> {
    return this.currentChainId
  }

  public async getAccount(): Promise<null> {
    return null
  }

  public deactivate() {
    this.active = false
  }

  public changeChainId(chainId: number) {
    invariant(Object.keys(this.providers).includes(chainId.toString()), `No url found for chainId ${chainId}`)
    if (this.active) {
      this.currentChainId = chainId
      this.emitUpdate({ provider: this.providers[this.currentChainId], chainId })
    } else {
      this.currentChainId = chainId
    }
  }
}
