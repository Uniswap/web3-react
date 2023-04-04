import { createWeb3ReactStoreAndActions } from '@web3-react/store'
import type { Actions, Web3ReactStore } from '@web3-react/types'
import { CoinbaseWallet } from '.'
import { MockEIP1193Provider } from '@web3-react/core'

jest.mock(
  '@coinbase/wallet-sdk',
  () =>
    class MockCoinbaseWallet {
      makeWeb3Provider() {
        return new MockEIP1193Provider()
      }
    }
)

const chainId = '0x1'
const accounts: string[] = []

describe('Coinbase Wallet', () => {
  let store: Web3ReactStore
  let connector: CoinbaseWallet
  let mockProvider: MockEIP1193Provider

  describe('connectEagerly = true', () => {
    beforeEach(async () => {
      let actions: Actions
      ;[store, actions] = createWeb3ReactStoreAndActions()
      connector = new CoinbaseWallet({
        actions,
        options: {
          appName: 'test',
          url: 'https://mock.url',
        },
      })
      await connector.connectEagerly().catch(() => {})

      mockProvider = connector.provider as unknown as MockEIP1193Provider
      mockProvider.chainId = chainId
      mockProvider.accounts = accounts
    })

    test('#activate', async () => {
      await connector.activate()

      expect(mockProvider.eth_requestAccounts).toHaveBeenCalled()
      expect(mockProvider.eth_accounts).not.toHaveBeenCalled()
      expect(mockProvider.eth_chainId).toHaveBeenCalled()
      expect(mockProvider.eth_chainId.mock.invocationCallOrder[0])
        .toBeGreaterThan(mockProvider.eth_requestAccounts.mock.invocationCallOrder[0])

      expect(store.getState()).toEqual({
        chainId: Number.parseInt(chainId, 16),
        accounts,
        activating: false,
      })
    })
  })
})
