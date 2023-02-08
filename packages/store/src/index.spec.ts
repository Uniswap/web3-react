import { createWeb3ReactStoreAndActions, MAX_SAFE_CHAIN_ID } from '.'

describe('#createWeb3ReactStoreAndActions', () => {
  test('uninitialized', () => {
    const [store] = createWeb3ReactStoreAndActions()
    expect(store.getState()).toEqual({
      chainId: undefined,
      accounts: undefined,
      accountIndex: undefined,
      activating: false,
      error: undefined,
      addingChain: undefined,
      switchingChain: undefined,
      watchingAsset: undefined,
    })
  })

  describe('#startActivation', () => {
    test('works', () => {
      const [store, actions] = createWeb3ReactStoreAndActions()
      actions.startActivation()
      expect(store.getState()).toEqual({
        chainId: undefined,
        accounts: undefined,
        accountIndex: undefined,
        activating: true,
        error: undefined,
        addingChain: undefined,
        switchingChain: undefined,
        watchingAsset: undefined,
      })
    })

    test('cancellation works', () => {
      const [store, actions] = createWeb3ReactStoreAndActions()
      const cancelActivation = actions.startActivation()

      cancelActivation()

      expect(store.getState()).toEqual({
        chainId: undefined,
        accounts: undefined,
        accountIndex: undefined,
        activating: false,
        error: undefined,
        addingChain: undefined,
        switchingChain: undefined,
        watchingAsset: undefined,
      })
    })
  })

  describe('#update', () => {
    test('throws on bad chainIds', () => {
      const [, actions] = createWeb3ReactStoreAndActions()
      for (const chainId of [1.1, 0, MAX_SAFE_CHAIN_ID + 1]) {
        expect(() => actions.update({ chainId })).toThrow(`Invalid chainId ${chainId}`)
      }
    })

    test('throws on bad accounts', () => {
      const [, actions] = createWeb3ReactStoreAndActions()
      expect(() => actions.update({ accounts: ['0x000000000000000000000000000000000000000'] })).toThrow()
    })

    test('chainId', () => {
      const [store, actions] = createWeb3ReactStoreAndActions()
      const chainId = 1
      actions.update({ chainId })
      expect(store.getState()).toEqual({
        chainId,
        accounts: undefined,
        accountIndex: undefined,
        activating: false,
        error: undefined,
        addingChain: undefined,
        switchingChain: undefined,
        watchingAsset: undefined,
      })
    })

    describe('accounts', () => {
      test('empty', () => {
        const [store, actions] = createWeb3ReactStoreAndActions()
        const accounts: string[] = []
        actions.update({ accounts })
        expect(store.getState()).toEqual({
          chainId: undefined,
          accounts,
          accountIndex: undefined,
          activating: false,
          error: undefined,
          addingChain: undefined,
          switchingChain: undefined,
          watchingAsset: undefined,
        })
      })

      test('single', () => {
        const [store, actions] = createWeb3ReactStoreAndActions()
        const accounts = ['0x0000000000000000000000000000000000000000']
        actions.update({ accounts })
        expect(store.getState()).toEqual({
          chainId: undefined,
          accounts,
          accountIndex: 0,
          activating: false,
          error: undefined,
          addingChain: undefined,
          switchingChain: undefined,
          watchingAsset: undefined,
        })
      })

      test('multiple', () => {
        const [store, actions] = createWeb3ReactStoreAndActions()
        const accounts = ['0x0000000000000000000000000000000000000000', '0x0000000000000000000000000000000000000001']
        actions.update({ accounts })
        expect(store.getState()).toEqual({
          chainId: undefined,
          accounts,
          accountIndex: 0,
          activating: false,
          error: undefined,
          addingChain: undefined,
          switchingChain: undefined,
          watchingAsset: undefined,
        })
      })
    })

    test('both', () => {
      const [store, actions] = createWeb3ReactStoreAndActions()
      const chainId = 1
      const accounts: string[] = []
      actions.update({ chainId, accounts })
      expect(store.getState()).toEqual({
        chainId,
        accounts,
        accountIndex: undefined,
        activating: false,
        error: undefined,
        addingChain: undefined,
        switchingChain: undefined,
        watchingAsset: undefined,
      })
    })

    test('chainId does not unset activating', () => {
      const [store, actions] = createWeb3ReactStoreAndActions()
      const chainId = 1
      actions.startActivation()
      actions.update({ chainId })
      expect(store.getState()).toEqual({
        chainId,
        accounts: undefined,
        accountIndex: undefined,
        activating: true,
        error: undefined,
        addingChain: undefined,
        switchingChain: undefined,
        watchingAsset: undefined,
      })
    })

    test('accounts does not unset activating', () => {
      const [store, actions] = createWeb3ReactStoreAndActions()
      const accounts: string[] = []
      actions.startActivation()
      actions.update({ accounts })
      expect(store.getState()).toEqual({
        chainId: undefined,
        accounts,
        accountIndex: undefined,
        activating: true,
        error: undefined,
        addingChain: undefined,
        switchingChain: undefined,
        watchingAsset: undefined,
      })
    })

    test('unsets activating', () => {
      const [store, actions] = createWeb3ReactStoreAndActions()
      const chainId = 1
      const accounts: string[] = []
      actions.startActivation()
      actions.update({ chainId, accounts })
      expect(store.getState()).toEqual({
        chainId,
        accounts,
        accountIndex: undefined,
        activating: false,
        error: undefined,
        addingChain: undefined,
        switchingChain: undefined,
        watchingAsset: undefined,
      })
    })
  })
})
