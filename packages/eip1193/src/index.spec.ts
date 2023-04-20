import { Eip1193Bridge } from '@ethersproject/experimental'
import { Web3Provider } from '@ethersproject/providers'
import { createWeb3ReactStoreAndActions } from '@web3-react/store'
import { MockEIP1193Provider } from '@web3-react/core'
import type { Actions, Web3ReactStore, ProviderRpcError } from '@web3-react/types'
import { EIP1193 } from '.'

class MockProviderRpcError extends Error implements ProviderRpcError {
  public code: number
  constructor() {
    super('Mock Provider RPC Error')
    this.code = 4200
  }
}

const chainId = '0x1'
const accounts: string[] = []

describe('EIP1193', () => {
  let mockProvider: MockEIP1193Provider

  let store: Web3ReactStore
  let actions: Actions

  let connector: EIP1193

  beforeEach(() => {
    mockProvider = new MockEIP1193Provider()
    ;[store, actions] = createWeb3ReactStoreAndActions()
  })

  describe('ethers', () => {
    afterEach(() => {
      expect(mockProvider.eth_chainId.mock.calls.length).toBe(1)
      expect(mockProvider.eth_accounts.mock.calls.length).toBe(0)
      expect(mockProvider.eth_requestAccounts.mock.calls.length).toBe(1)
    })

    test('works', async () => {
      mockProvider.chainId = chainId
      mockProvider.accounts = accounts

      const web3Provider = new Web3Provider(mockProvider)
      const wrapped = new Eip1193Bridge(web3Provider.getSigner(), web3Provider)

      connector = new EIP1193({ actions, provider: wrapped })

      await connector.activate()

      expect(store.getState()).toEqual({
        chainId: 1,
        accounts,
        activating: false,
      })
    })
  })

  describe('functions', () => {
    describe('connectEagerly = true', () => {
      beforeEach(() => {
        expect(mockProvider.eth_chainId.mock.calls.length).toBe(0)
        expect(mockProvider.eth_accounts.mock.calls.length).toBe(0)
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
        connector = new EIP1193({ actions, provider: mockProvider })
        await connector.connectEagerly().catch(() => {})

        expect(store.getState()).toEqual({
          chainId: undefined,
          accounts: undefined,
          activating: false,
        })

        expect(mockProvider.eth_chainId.mock.calls.length).toBe(0)
        expect(mockProvider.eth_accounts.mock.calls.length).toBe(0)
        expect(mockProvider.eth_requestAccounts.mock.calls.length).toBe(0)
      })

      test('succeeds', async () => {
        mockProvider.chainId = chainId
        mockProvider.accounts = accounts

        connector = new EIP1193({ actions, provider: mockProvider })
        await connector.connectEagerly()

        expect(store.getState()).toEqual({
          chainId: 1,
          accounts,
          activating: false,
        })

        expect(mockProvider.eth_chainId.mock.calls.length).toBe(1)
        expect(mockProvider.eth_accounts.mock.calls.length).toBe(1)
        expect(mockProvider.eth_requestAccounts.mock.calls.length).toBe(0)
        expect(mockProvider.eth_chainId.mock.invocationCallOrder[0])
          .toBeGreaterThan(mockProvider.eth_accounts.mock.invocationCallOrder[0])
      })
    })

    describe('connectEagerly = false', () => {
      beforeEach(() => {
        connector = new EIP1193({ actions, provider: mockProvider })
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
        })
      })

      describe('#activate', () => {
        afterEach(() => {
          expect(mockProvider.eth_chainId.mock.calls.length).toBe(1)
          expect(mockProvider.eth_accounts.mock.calls.length).toBe(0)
          expect(mockProvider.eth_requestAccounts.mock.calls.length).toBe(1)
          expect(mockProvider.eth_chainId.mock.invocationCallOrder[0])
            .toBeGreaterThan(mockProvider.eth_requestAccounts.mock.invocationCallOrder[0])
        })

        test(`chainId = ${chainId}`, async () => {
          mockProvider.chainId = chainId
          mockProvider.accounts = accounts

          await connector.activate()

          expect(store.getState()).toEqual({
            chainId: 1,
            accounts,
            activating: false,
          })
        })

        test("chainId = '0x01'", async () => {
          mockProvider.chainId = '0x01'
          mockProvider.accounts = accounts

          await connector.activate()

          expect(store.getState()).toEqual({
            chainId: 1,
            accounts,
            activating: false,
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
          })
        })
      })
    })
  })

  describe('events', () => {
    beforeEach(() => {
      connector = new EIP1193({ actions, provider: mockProvider })
    })

    afterEach(() => {
      expect(mockProvider.eth_chainId.mock.calls.length).toBe(0)
      expect(mockProvider.eth_accounts.mock.calls.length).toBe(0)
      expect(mockProvider.eth_requestAccounts.mock.calls.length).toBe(0)
    })

    const chainId = '0x1'
    const accounts: string[] = []
    const error = new MockProviderRpcError()

    test('#connect', async () => {
      mockProvider.emitConnect(chainId)

      expect(store.getState()).toEqual({
        chainId: 1,
        accounts: undefined,
        activating: false,
        error: undefined,
      })
    })

    test('#disconnect', async () => {
      mockProvider.emitDisconnect(error)

      expect(store.getState()).toEqual({
        chainId: undefined,
        accounts: undefined,
        activating: false,
      })
    })

    test('#chainChanged', async () => {
      mockProvider.emitChainChanged(chainId)

      expect(store.getState()).toEqual({
        chainId: 1,
        accounts: undefined,
        activating: false,
      })
    })

    test('#accountsChanged', async () => {
      mockProvider.emitAccountsChanged(accounts)

      expect(store.getState()).toEqual({
        chainId: undefined,
        accounts,
        activating: false,
      })
    })

    test('initializes with connect', async () => {
      mockProvider.emitConnect(chainId)
      mockProvider.emitAccountsChanged(accounts)

      expect(store.getState()).toEqual({
        chainId: 1,
        accounts,
        activating: false,
      })
    })

    test('initializes with chainChanged', async () => {
      mockProvider.emitChainChanged(chainId)
      mockProvider.emitAccountsChanged(accounts)

      expect(store.getState()).toEqual({
        chainId: 1,
        accounts,
        activating: false,
      })
    })
  })
})
