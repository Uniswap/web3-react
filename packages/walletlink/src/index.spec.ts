import { createWeb3ReactStoreAndActions } from '@web3-react/store'
import type { Actions, Web3ReactStore } from '@web3-react/types'
import { WalletLink } from '.'
import { MockEIP1193Provider } from '../../eip1193/src/index.spec'

jest.mock('walletlink', () => ({
  WalletLink: class MockWalletLink {
    makeWeb3Provider() {
      return new MockEIP1193Provider()
    }
  },
}))

const chainId = '0x1'
const accounts: string[] = []

describe('WalletLink', () => {
  let store: Web3ReactStore
  let connector: WalletLink
  let mockConnector: MockEIP1193Provider

  describe('connectEagerly = true', () => {
    beforeEach(() => {
      let actions: Actions
      ;[store, actions] = createWeb3ReactStoreAndActions()
      connector = new WalletLink(
        actions,
        {
          appName: 'test',
          url: 'https://mock.url',
        },
        true
      )
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
})
