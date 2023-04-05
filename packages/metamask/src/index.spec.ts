import { createWeb3ReactStoreAndActions } from '@web3-react/store'
import type { Actions, Web3ReactStore } from '@web3-react/types'
import { MetaMask } from '.'
import { MockEIP1193Provider } from '@web3-react/core'

const chainId = '0x1'
const accounts: string[] = ['0x0000000000000000000000000000000000000000']

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

  test('#connectEagerly', async () => {
    mockProvider.chainId = chainId
    mockProvider.accounts = accounts

    await connector.connectEagerly()

    expect(mockProvider.eth_requestAccounts).not.toHaveBeenCalled()
    expect(mockProvider.eth_accounts).toHaveBeenCalled()
    expect(mockProvider.eth_chainId).toHaveBeenCalled()
    expect(mockProvider.eth_chainId.mock.invocationCallOrder[0])
      .toBeGreaterThan(mockProvider.eth_accounts.mock.invocationCallOrder[0])

    expect(store.getState()).toEqual({
      chainId: Number.parseInt(chainId, 16),
      accounts,
      activating: false,
    })
  })

  test('#activate', async () => {
    mockProvider.chainId = chainId
    mockProvider.accounts = accounts

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
