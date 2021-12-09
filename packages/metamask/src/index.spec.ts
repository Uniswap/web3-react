import { createWeb3ReactStoreAndActions } from '@web3-react/store'
import { Actions, Web3ReactStore } from '@web3-react/types'
import { MetaMask } from '.'
import { MockEIP1193Provider } from '../../eip1193/src/index.spec'

describe('MetaMask', () => {
  let mockProvider: MockEIP1193Provider

  beforeEach(() => {
    mockProvider = new MockEIP1193Provider()
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
