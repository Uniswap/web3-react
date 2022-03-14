import { createWeb3ReactStoreAndActions } from '@web3-react/store'
import type { Actions, Web3ReactStore } from '@web3-react/types'
import { Url } from '.'
import { MockEIP1193Provider } from '../../eip1193/src/index.spec'

jest.mock('@ethersproject/providers', () => ({
  JsonRpcProvider: class MockJsonRpcProvider {
    getSigner() {}
  },
}))

jest.mock('@ethersproject/experimental', () => ({
  Eip1193Bridge: MockEIP1193Provider,
}))

const chainId = '0x1'
const accounts: string[] = []

const HALF_INITIALIZED_STATE_BECAUSE_OF_MOCKS = {
  chainId: undefined,
  accounts: [],
  activating: true,
  error: undefined,
}

describe('Url', () => {
  let store: Web3ReactStore
  let connector: Url
  let mockConnector: MockEIP1193Provider

  describe('connectEagerly = true', () => {
    beforeEach(() => {
      let actions: Actions
      ;[store, actions] = createWeb3ReactStoreAndActions()
      connector = new Url(actions, 'https://mock.url', true)
    })

    beforeEach(async () => {
      mockConnector = connector.provider as unknown as MockEIP1193Provider
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
      connector = new Url(actions, 'https://mock.url', false)
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
        mockConnector = connector.provider as unknown as MockEIP1193Provider
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
})
