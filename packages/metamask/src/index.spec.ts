import { createWeb3ReactStoreAndActions } from '@web3-react/store'
import { Actions, RequestArguments, Web3ReactStore } from '@web3-react/types'
import { EventEmitter } from 'node:events'
import { MetaMask } from '.'

class MockProvider extends EventEmitter {
  public chainId?: string
  public accounts?: string[]

  public eth_chainId = jest.fn((chainId?: string) => chainId)
  public eth_accounts = jest.fn((accounts?: string[]) => accounts)
  public eth_requestAccounts = jest.fn((accounts?: string[]) => accounts)

  public request(x: RequestArguments): Promise<unknown> {
    switch (x.method) {
      case 'eth_chainId':
        return Promise.resolve(this.eth_chainId(this.chainId))
      case 'eth_accounts':
        return Promise.resolve(this.eth_accounts(this.accounts))
      case 'eth_requestAccounts':
        return Promise.resolve(this.eth_requestAccounts(this.accounts))
      default:
        throw new Error()
    }
  }
}

describe('MetaMask', () => {
  let mockProvider: MockProvider

  beforeEach(() => {
    mockProvider = new MockProvider()
  })

  let store: Web3ReactStore
  let connector: MetaMask

  describe('#activate', () => {
    beforeEach(() => {
      let actions: Actions
      ;[store, actions] = createWeb3ReactStoreAndActions()
      connector = new MetaMask(actions, false)
    })

    beforeEach(() => {
      ;(window as any).ethereum = mockProvider
    })

    describe('#activate', () => {
      test('works', async () => {
        const chainId = '0x1'
        const accounts: string[] = []

        mockProvider.chainId = chainId
        mockProvider.accounts = accounts

        await connector.activate()

        expect(store.getState()).toEqual({
          chainId: 1,
          accounts,
          activating: false,
          error: undefined,
        })
      })
    })
  })
})
