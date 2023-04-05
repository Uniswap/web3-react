import { createWeb3ReactStoreAndActions } from '@web3-react/store'
import type { Actions, RequestArguments, Web3ReactStore } from '@web3-react/types'
import EventEmitter from 'eventemitter3'
import { WalletConnect } from '.'
import { MockEIP1193Provider } from '@web3-react/core'

class MockWalletConnectProvider extends MockEIP1193Provider<number> {
  /**
   * TODO(INFRA-140): We're using the following private API to fix an underlying WalletConnect issue.
   * See {@link WalletConnect.activate} for details.
   */
  private setHttpProvider() {}
}

jest.mock('@walletconnect/ethereum-provider', () => MockWalletConnectProvider)

const chainId = 1
const accounts: string[] = []

describe('WalletConnect', () => {
  let store: Web3ReactStore
  let connector: WalletConnect
  let mockProvider: MockWalletConnectProvider

  describe('works', () => {
    beforeEach(async () => {
      let actions: Actions
      ;[store, actions] = createWeb3ReactStoreAndActions()
      connector = new WalletConnect({ actions, options: { rpc: {} } })
    })

    test('#activate', async () => {
      await connector.connectEagerly().catch(() => {})

      mockProvider = connector.provider as unknown as MockWalletConnectProvider
      mockProvider.chainId = chainId
      mockProvider.accounts = accounts

      await connector.activate()

      expect(mockProvider.eth_requestAccounts).toHaveBeenCalled()
      expect(mockProvider.eth_accounts).not.toHaveBeenCalled()
      expect(mockProvider.eth_chainId).toHaveBeenCalled()
      expect(mockProvider.eth_chainId.mock.invocationCallOrder[0])
        .toBeGreaterThan(mockProvider.eth_requestAccounts.mock.invocationCallOrder[0])

      expect(store.getState()).toEqual({
        chainId,
        accounts,
        activating: false,
        error: undefined,
      })
    })
  })
})
