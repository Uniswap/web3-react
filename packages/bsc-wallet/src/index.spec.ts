import type { Actions, Web3ReactStore } from '@web3-react/types'
import { createWeb3ReactStoreAndActions } from '@web3-react/store'
import { BscWallet } from '.'
import { MockEIP1193Provider } from '../../eip1193/src/mock'

const chainId = '0x38'
const accounts: string[] = []

describe('BscWallet', () => {
  let mockProvider: MockEIP1193Provider

  beforeEach(() => {
    mockProvider = new MockEIP1193Provider()
  })

  beforeEach(() => {
    ;(window as any).BinanceChain = mockProvider
  })

  let store: Web3ReactStore
  let connector: BscWallet

  beforeEach(() => {
    let actions: Actions
    ;[store, actions] = createWeb3ReactStoreAndActions()
    connector = new BscWallet({ actions })
  })

  test('#activate', async () => {
    mockProvider.chainId = chainId
    mockProvider.accounts = accounts

    await connector.activate()

    expect(store.getState()).toEqual({
      chainId: Number.parseInt(chainId, 16),
      accounts,
      accountIndex: undefined,
      activating: false,
      addingChain: undefined,
      switchingChain: undefined,
      watchingAsset: undefined,
    })
  })
})
