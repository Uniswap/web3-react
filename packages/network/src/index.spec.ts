import { createWeb3ReactStoreAndActions } from '@web3-react/store'
import type { Actions, Web3ReactStore } from '@web3-react/types'
import { MockEip1193Bridge } from '../../url/src/index.spec'
import { Network } from './'

jest.mock('@ethersproject/providers', () => ({
  JsonRpcProvider: class MockJsonRpcProvider {
    getSigner() {}
  },
  FallbackProvider: class MockFallbackProvider {},
}))

jest.mock('@ethersproject/experimental', () => ({
  Eip1193Bridge: MockEip1193Bridge,
}))

const chainId = '0x1'
const accounts: string[] = []

describe('Url', () => {
  let store: Web3ReactStore
  let connector: Network
  let mockConnector: MockEip1193Bridge

  describe('connectEagerly = true', () => {
    beforeEach(() => {
      let actions: Actions
      ;[store, actions] = createWeb3ReactStoreAndActions()
      connector = new Network(actions, { 1: 'https://mock.url' })
    })

    beforeEach(async () => {
      mockConnector = connector.provider as unknown as MockEip1193Bridge
      mockConnector.chainId = chainId
      mockConnector.accounts = accounts
    })

    test('#activate', async () => {
      await connector.activate()

      expect(store.getState()).toEqual({
        chainId: Number.parseInt(chainId, 16),
        accounts,
        activating: false,
        error: undefined,
      })
    })
  })

  describe('connectEagerly = false', () => {
    beforeEach(() => {
      let actions: Actions
      ;[store, actions] = createWeb3ReactStoreAndActions()
      connector = new Network(actions, { 1: 'https://mock.url' }, false)
    })

    test('is un-initialized', async () => {
      expect(store.getState()).toEqual({
        chainId: undefined,
        accounts: undefined,
        activating: false,
        error: undefined,
      })
    })

    describe('#activate', () => {
      beforeEach(async () => {
        // testing hack to ensure the provider is set
        await connector.activate()
        mockConnector = connector.provider as unknown as MockEip1193Bridge
        mockConnector.chainId = chainId
        mockConnector.accounts = accounts
      })

      test('works', async () => {
        await connector.activate()

        expect(store.getState()).toEqual({
          chainId: Number.parseInt(chainId, 16),
          accounts,
          activating: false,
          error: undefined,
        })
      })
    })
  })

  describe('array of urls', () => {
    beforeEach(() => {
      let actions: Actions
      ;[store, actions] = createWeb3ReactStoreAndActions()
      connector = new Network(actions, { 1: ['https://1.mock.url', 'https://2.mock.url'] })
    })

    beforeEach(async () => {
      mockConnector = connector.provider as unknown as MockEip1193Bridge
      mockConnector.chainId = chainId
      mockConnector.accounts = accounts
    })

    test('#activate', async () => {
      await connector.activate()

      expect(store.getState()).toEqual({
        chainId: Number.parseInt(chainId, 16),
        accounts,
        activating: false,
        error: undefined,
      })
    })
  })

  describe('multiple chains', () => {
    beforeEach(() => {
      let actions: Actions
      ;[store, actions] = createWeb3ReactStoreAndActions()
      connector = new Network(actions, { 1: 'https://mainnet.mock.url', 2: 'https://testnet.mock.url' })
    })

    beforeEach(async () => {
      mockConnector = connector.provider as unknown as MockEip1193Bridge
      mockConnector.chainId = chainId
      mockConnector.accounts = accounts
    })

    describe('#activate', () => {
      test('chainId = 1', async () => {
        mockConnector = connector.provider as unknown as MockEip1193Bridge
        mockConnector.chainId = chainId
        mockConnector.accounts = accounts
        await connector.activate()

        expect(store.getState()).toEqual({
          chainId: Number.parseInt(chainId, 16),
          accounts,
          activating: false,
          error: undefined,
        })
      })

      test('chainId = 2', async () => {
        // testing hack to ensure the provider is set
        await connector.activate(2)
        mockConnector = connector.provider as unknown as MockEip1193Bridge
        mockConnector.chainId = '0x2'
        mockConnector.accounts = accounts

        await connector.activate(2)

        expect(store.getState()).toEqual({
          chainId: 2,
          accounts,
          activating: false,
          error: undefined,
        })
      })
    })
  })
})
