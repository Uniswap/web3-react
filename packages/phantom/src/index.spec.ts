import { createWeb3ReactStoreAndActions } from '@web3-react/store'
import type { Actions, Web3ReactStore } from '@web3-react/types'
import { Phantom } from '.'
import { MockEIP1193Provider } from '../../eip1193/src/index.spec'

const chainId = '0x1'
const accounts: string[] = []

describe('Phantom', () => {
  let mockProvider: MockEIP1193Provider
  let store: Web3ReactStore
  let connector: Phantom

  beforeEach(() => {
    mockProvider = new MockEIP1193Provider()
  })

  beforeEach(() => {
    ;(window as any).ethereum = mockProvider
    ;(window as any).ethereum.isPhantom = true 
  })

  beforeEach(() => {
    let actions: Actions
    ;[store, actions] = createWeb3ReactStoreAndActions()
    connector = new Phantom({ actions })
  })

  describe('connectEagerly = true', () => {
    beforeEach(async () => {
      let actions: Actions
      ;[store, actions] = createWeb3ReactStoreAndActions()
      connector = new Phantom({
        actions,
      })
      await connector.connectEagerly().catch(() => {})

      mockProvider = connector.provider as MockEIP1193Provider
      mockProvider.chainId = chainId
      mockProvider.accounts = accounts
    })

    test('#activate', async () => {

      await connector.activate()

      expect(store.getState()).toEqual({
        chainId: Number.parseInt(chainId, 16),
        accounts,
        activating: false,
      })
    })
  })
})
