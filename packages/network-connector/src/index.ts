import { ConnectorUpdate } from '@web3-react/types'
import { AbstractConnector } from '@web3-react/abstract-connector'
import invariant from 'tiny-invariant'

// taken from ethers.js, compatible interface with web3 provider
type AsyncSendable = {
  isMetaMask?: boolean
  host?: string
  path?: string
  sendAsync?: (request: any, callback: (error: any, response: any) => void) => void
  send?: (request: any, callback: (error: any, response: any) => void) => void
}

export class RequestError extends Error {
  constructor(message: string, public code: number, public data?: unknown) {
    super()
    this.name = this.constructor.name
    this.message = message
  }
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

  public readonly sendAsync = (
    request: { jsonrpc: '2.0'; id: number | string | null; method: string; params?: unknown[] | object },
    callback: (error: any, response: any) => void
  ): void => {
    console.log('sendAsync', request.method, request.params)
    this.request(request.method, request.params)
      .then(result => callback(null, { jsonrpc: '2.0', id: request.id, result }))
      .catch(error => callback(error, null))
  }

  public readonly request = async (
    method: string | { method: string; params?: unknown[] | object },
    params?: unknown[] | object
  ): Promise<unknown> => {
    if (typeof method !== 'string') {
      params = (method as any).params
      method = method.method
    }

    const response = await fetch(this.url, {
      method: 'POST',
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method,
        params
      })
    })
    if (!response.ok) throw new RequestError(`${response.status}: ${response.statusText}`, -32000)
    const body = await response.json()
    if ('error' in body) {
      throw new RequestError(body?.error?.message, body?.error?.code, body?.error?.data)
    } else if ('result' in body) {
      return body.result
    } else {
      throw new RequestError(`Received unexpected JSON-RPC response to ${method} request.`, -32000, body)
    }
  }
}

interface NetworkConnectorArguments {
  urls: { [chainId: number]: string }
  defaultChainId?: number
}

export class NetworkConnector extends AbstractConnector {
  private readonly providers: { [chainId: number]: MiniRpcProvider }
  private currentChainId: number

  constructor({ urls, defaultChainId }: NetworkConnectorArguments) {
    invariant(defaultChainId || Object.keys(urls).length === 1, 'defaultChainId is a required argument with >1 url')
    super({ supportedChainIds: Object.keys(urls).map((k): number => Number(k)) })

    this.currentChainId = defaultChainId || Number(Object.keys(urls)[0])
    this.providers = Object.keys(urls).reduce<{ [chainId: number]: MiniRpcProvider }>((accumulator, chainId) => {
      accumulator[Number(chainId)] = new MiniRpcProvider(Number(chainId), urls[Number(chainId)])
      return accumulator
    }, {})
  }

  public async activate(): Promise<ConnectorUpdate> {
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
    return
  }

  public changeChainId(chainId: number) {
    invariant(Object.keys(this.providers).includes(chainId.toString()), `No url found for chainId ${chainId}`)
    this.currentChainId = chainId
    this.emitUpdate({ provider: this.providers[this.currentChainId], chainId })
  }
}
