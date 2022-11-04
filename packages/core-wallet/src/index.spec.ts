import { createWeb3ReactStoreAndActions } from '@web3-react/store'
import type { Actions, Web3ReactStore } from '@web3-react/types'
import { CoreWallet } from '.'
import { MockEIP1193Provider } from '../../eip1193/src/index.spec'
import { CoreWalletProvider } from './utils'

const chainId = '0x1'
const accounts: string[] = []

class MockCoreWalletProvider extends MockEIP1193Provider {
  public isAvalanche = true;
}

describe('CoreWallet', () => {
  let mockProvider: MockCoreWalletProvider

  beforeEach(() => {
    mockProvider = new MockCoreWalletProvider() 
  })

  beforeEach(() => {
    ;(window as any).ethereum = mockProvider
  })

  let store: Web3ReactStore
  let connector: CoreWallet

  beforeEach(() => {
    let actions: Actions
    ;[store, actions] = createWeb3ReactStoreAndActions()
    connector = new CoreWallet({ actions })
  })

  test('#activate', async () => {
    mockProvider.chainId = chainId
    mockProvider.accounts = accounts

    await connector.activate()

    expect(store.getState()).toEqual({
      chainId: Number.parseInt(chainId, 16),
      accounts,
      activating: false,
    })
  })
})
