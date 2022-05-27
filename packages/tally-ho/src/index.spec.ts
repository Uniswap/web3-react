import { createWeb3ReactStoreAndActions } from '@web3-react/store'
import type { Actions, Web3ReactStore } from '@web3-react/types'
import { TallyHo } from '.'
import { MockEIP1193Provider } from '../../eip1193/src/index.spec'

const chainId = '0x1'
const accounts: string[] = []

export class MockTallyHoProvider extends MockEIP1193Provider {
  isTally = true

  constructor() {
    super()
  }
}

describe('TallyHo', () => {
  let mockProvider: MockTallyHoProvider

  beforeEach(() => {
    mockProvider = new MockTallyHoProvider()
  })

  beforeEach(() => {
    ;(window as any).tally = mockProvider
  })

  let store: Web3ReactStore
  let connector: TallyHo

  beforeEach(() => {
    let actions: Actions
    ;[store, actions] = createWeb3ReactStoreAndActions()
    connector = new TallyHo(actions, false)
  })

  test('#activate', async () => {
    mockProvider.chainId = chainId
    mockProvider.accounts = accounts

    await connector.activate()

    expect(store.getState()).toEqual({
      chainId: Number.parseInt(chainId, 16),
      accounts,
      activating: false,
      error: undefined,
    })
  })
})
