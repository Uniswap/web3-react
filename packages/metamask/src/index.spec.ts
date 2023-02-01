import { createWeb3ReactStoreAndActions } from '@web3-react/store'
import type { Actions, Web3ReactStore } from '@web3-react/types'
import { MetaMask } from '.'
import { MockEIP1193Provider } from '../../eip1193/src/mock'

const chainId = '0x1'
const accounts: string[] = []

describe('MetaMask', () => {
  let mockProvider: MockEIP1193Provider

  beforeEach(() => {
    mockProvider = new MockEIP1193Provider()
  })

  beforeEach(() => {
    ;(window as any).ethereum = mockProvider
  })

  let store: Web3ReactStore
  let connector: MetaMask

  beforeEach(() => {
    let actions: Actions
    ;[store, actions] = createWeb3ReactStoreAndActions()
    connector = new MetaMask({ actions })
  })

  test('#activate', async () => {
    mockProvider.eth_chainId.mockResolvedValue('0x0' as never)
    mockProvider.eth_accounts.mockResolvedValue([] as never)
    mockProvider.chainId = chainId
    mockProvider.accounts = accounts

    await connector.activate()

    expect(mockProvider.eth_chainId).toHaveBeenCalled()
    expect(mockProvider.eth_accounts).toHaveBeenCalled()
    expect(store.getState()).toEqual({
      chainId: Number.parseInt(chainId, 16),
      accounts,
      activating: false,
    })
  })
})
