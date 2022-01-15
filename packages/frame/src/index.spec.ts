import { createWeb3ReactStoreAndActions } from '@web3-react/store'
import type { Actions, Web3ReactStore } from '@web3-react/types'
import { Frame } from '.'

const chainId = '0x1'
const accounts: string[] = []

describe('Frame', () => {
  let store: Web3ReactStore
  let connector: Frame

  beforeEach(() => {
    let actions: Actions
    ;[store, actions] = createWeb3ReactStoreAndActions()
    connector = new Frame(actions, { origin: 'Web3ReactTests' })
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
