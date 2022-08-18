import { createWeb3ReactStoreAndActions } from '@web3-react/store'
import type { Actions, Web3ReactStore } from '@web3-react/types'
import { TokenPocket } from '.'
import { MockEIP1193Provider } from '../../eip1193/src/index.spec'

const chainId = '0x1'
const accounts: string[] = []

describe('TokenPocket', () => {
  let mockProvider: MockEIP1193Provider

  beforeEach(() => {
    mockProvider = new MockEIP1193Provider()
  })

  beforeEach(() => {
    ; (window as any).ethereum = mockProvider
  })

  let store: Web3ReactStore
  let connector: TokenPocket

  beforeEach(() => {
    let actions: Actions
      ;[store, actions] = createWeb3ReactStoreAndActions()
    connector = new TokenPocket({ actions })
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
