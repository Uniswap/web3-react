import { createWeb3ReactStoreAndActions } from '@web3-react/store'
import type { Actions, Web3ReactStore } from '@web3-react/types'
import { Url } from '.'
import { MockJsonRpcProvider } from '../../network/src/index.spec'

jest.mock('@ethersproject/providers', () => ({
  JsonRpcProvider: MockJsonRpcProvider,
}))

const chainId = '0x1'
const accounts: string[] = []

describe('Url', () => {
  let store: Web3ReactStore
  let connector: Url
  let mockConnector: MockJsonRpcProvider

  describe('connectEagerly = true', () => {
    beforeEach(() => {
      let actions: Actions
      ;[store, actions] = createWeb3ReactStoreAndActions()
      connector = new Url(actions, 'https://mock.url', true)
    })

    beforeEach(async () => {
      mockConnector = connector.customProvider as unknown as MockJsonRpcProvider
      mockConnector.chainId = chainId
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
        mockConnector = connector.customProvider as unknown as MockJsonRpcProvider
        mockConnector.chainId = chainId
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
