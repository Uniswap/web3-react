import { createWeb3ReactStoreAndActions } from '@web3-react/store'
import { Actions, RequestArguments, Web3ReactStore } from '@web3-react/types'
import { EventEmitter } from 'node:events'
import { EIP1193 } from '.'

async function yieldThread() {
  await new Promise((resolve) => setTimeout(resolve, 0))
}

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

  public connect(chainId: string) {
    this.emit('connect', { chainId })
  }

  public disconnect(error: Error) {
    this.emit('disconnect', error)
  }

  public chainChanged(chainId: string) {
    this.emit('chainChanged', chainId)
  }

  public accountsChanged(accounts: string[]) {
    this.emit('accountsChanged', accounts)
  }
}

describe('EIP1193', () => {
  let mockProvider: MockProvider

  beforeEach(() => {
    mockProvider = new MockProvider()
  })

  let store: Web3ReactStore
  let actions: Actions
  let connector: EIP1193

  describe('functions', () => {
    describe('connectEagerly = true', () => {
      beforeEach(() => {
        ;[store, actions] = createWeb3ReactStoreAndActions()
      })

      beforeEach(() => {
        expect(mockProvider.eth_chainId.mock.calls.length).toBe(0)
        expect(mockProvider.eth_accounts.mock.calls.length).toBe(0)
        expect(mockProvider.eth_requestAccounts.mock.calls.length).toBe(0)
      })

      afterEach(() => {
        expect(mockProvider.eth_chainId.mock.calls.length).toBe(1)
        expect(mockProvider.eth_accounts.mock.calls.length).toBe(1)
        expect(mockProvider.eth_requestAccounts.mock.calls.length).toBe(0)
      })

      // suppress console.debugs in this block
      beforeEach(() => {
        jest.spyOn(console, 'debug').mockImplementation(() => {})
      })
      afterEach(() => {
        jest.clearAllMocks()
      })

      test('fails silently', async () => {
        connector = new EIP1193(actions, mockProvider)

        await yieldThread()
        expect(store.getState()).toEqual({
          chainId: undefined,
          accounts: undefined,
          activating: false,
          error: undefined,
        })
      })

      test('succeeds', async () => {
        const chainId = '0x01'
        const accounts: string[] = []

        mockProvider.chainId = chainId
        mockProvider.accounts = accounts

        connector = new EIP1193(actions, mockProvider)

        await yieldThread()
        expect(store.getState()).toEqual({
          chainId: 1,
          accounts,
          activating: false,
          error: undefined,
        })
      })
    })

    describe('connectEagerly = false', () => {
      beforeEach(() => {
        ;[store, actions] = createWeb3ReactStoreAndActions()
        connector = new EIP1193(actions, mockProvider, false)
      })

      beforeEach(() => {
        expect(mockProvider.eth_chainId.mock.calls.length).toBe(0)
        expect(mockProvider.eth_accounts.mock.calls.length).toBe(0)
        expect(mockProvider.eth_requestAccounts.mock.calls.length).toBe(0)
      })

      test('before', () => {
        expect(store.getState()).toEqual({
          chainId: undefined,
          accounts: undefined,
          activating: false,
          error: undefined,
        })
      })

      describe('#activate', () => {
        afterEach(() => {
          expect(mockProvider.eth_chainId.mock.calls.length).toBe(1)
          expect(mockProvider.eth_accounts.mock.calls.length).toBe(0)
          expect(mockProvider.eth_requestAccounts.mock.calls.length).toBe(1)
        })

        test("chainId = '0x1'", async () => {
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

        test("chainId = '0x01'", async () => {
          const chainId = '0x01'
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

        test("accounts = ['0x0000000000000000000000000000000000000000']", async () => {
          const chainId = '0x1'
          const accounts: string[] = ['0x0000000000000000000000000000000000000000']

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

        test("accounts = ['0x0000000000000000000000000000000000000000', '0x0000000000000000000000000000000000000001']", async () => {
          const chainId = '0x1'
          const accounts: string[] = [
            '0x0000000000000000000000000000000000000000',
            '0x0000000000000000000000000000000000000001',
          ]

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

  describe('events', () => {
    beforeEach(() => {
      ;[store, actions] = createWeb3ReactStoreAndActions()
      connector = new EIP1193(actions, mockProvider, false)
    })

    afterEach(() => {
      expect(mockProvider.eth_chainId.mock.calls.length).toBe(0)
      expect(mockProvider.eth_accounts.mock.calls.length).toBe(0)
      expect(mockProvider.eth_requestAccounts.mock.calls.length).toBe(0)
    })

    const chainId = '0x1'
    const accounts: string[] = []
    const error = new Error()

    test('#connect', async () => {
      mockProvider.connect(chainId)

      expect(store.getState()).toEqual({
        chainId: 1,
        accounts: undefined,
        activating: false,
        error: undefined,
      })
    })

    test('#disconnect', async () => {
      mockProvider.disconnect(error)

      expect(store.getState()).toEqual({
        chainId: undefined,
        accounts: undefined,
        activating: false,
        error,
      })
    })

    test('#chainChanged', async () => {
      mockProvider.chainChanged(chainId)

      expect(store.getState()).toEqual({
        chainId: 1,
        accounts: undefined,
        activating: false,
        error: undefined,
      })
    })

    test('#accountsChanged', async () => {
      mockProvider.accountsChanged(accounts)

      expect(store.getState()).toEqual({
        chainId: undefined,
        accounts,
        activating: false,
        error: undefined,
      })
    })

    test('initializes', async () => {
      mockProvider.connect(chainId)
      mockProvider.accountsChanged(accounts)

      expect(store.getState()).toEqual({
        chainId: 1,
        accounts,
        activating: false,
        error: undefined,
      })
    })
  })
})
