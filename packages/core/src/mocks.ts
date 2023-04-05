import type { ProviderRpcError, RequestArguments } from '@web3-react/types'
import { EventEmitter } from 'eventemitter3'

export class MockEIP1193Provider<T = string> extends EventEmitter {
  public chainId?: T
  public accounts?: string[]

  public eth_chainId = jest.fn((chainId?: T) => chainId)
  public eth_accounts = jest.fn((accounts?: string[]) => accounts)
  public eth_requestAccounts = jest.fn((accounts?: string[]) => accounts)

  public request(x: RequestArguments): Promise<unknown> {
    // make sure to throw if we're "not connected"
    if (!this.chainId) return Promise.reject(new Error())

    switch (x.method) {
      case 'eth_chainId':
        return Promise.resolve(this.eth_chainId(this.chainId))
      case 'eth_accounts':
        return Promise.resolve(this.eth_accounts(this.accounts))
      case 'eth_requestAccounts':
        return Promise.resolve(this.eth_requestAccounts(this.accounts))
      default:
        throw new Error(`Method not supported on mock: ${JSON.stringify(x)}`)
    }
  }

  public emitConnect(chainId: string) {
    this.emit('connect', { chainId })
  }

  public emitDisconnect(error: ProviderRpcError) {
    this.emit('disconnect', error)
  }

  public emitChainChanged(chainId: string) {
    this.emit('chainChanged', chainId)
  }

  public emitAccountsChanged(accounts: string[]) {
    this.emit('accountsChanged', accounts)
  }
}
