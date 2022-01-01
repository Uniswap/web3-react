import { ChainIdNotAllowedError, createWeb3ReactStoreAndActions, MAX_SAFE_CHAIN_ID } from '.'

test('ChainIdNotAllowedError', () => {
  const error = new ChainIdNotAllowedError(1, [2])
  expect(error).toBeInstanceOf(ChainIdNotAllowedError)
  expect(error.name).toBe('ChainIdNotAllowedError')
  expect(error.message).toBe(`chainId ${1} not included in ${2}`)
})

describe('#createWeb3ReactStoreAndActions', () => {
  test('throw on bad allowedChainIds', () => {
    expect(() => createWeb3ReactStoreAndActions([])).toThrow(`allowedChainIds is length 0`)
  })

  test('uninitialized', () => {
    const [store] = createWeb3ReactStoreAndActions()
    expect(store.getState()).toEqual({
      chainId: undefined,
      accounts: undefined,
      activating: false,
      error: undefined,
    })
  })

  describe('#startActivation', () => {
    test('#works', () => {
      const [store, actions] = createWeb3ReactStoreAndActions()
      actions.startActivation()
      expect(store.getState()).toEqual({
        chainId: undefined,
        accounts: undefined,
        activating: true,
        error: undefined,
      })
    })
    test('cancellation works', () => {
      const [store, actions] = createWeb3ReactStoreAndActions()
      const cancelActivation = actions.startActivation()

      cancelActivation()

      expect(store.getState()).toEqual({
        chainId: undefined,
        accounts: undefined,
        activating: false,
        error: undefined,
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

    test('errors on disallowed chainId', () => {
      const [store, actions] = createWeb3ReactStoreAndActions([2])
      actions.update({ chainId: 1 })
      expect(store.getState().error).toBeInstanceOf(ChainIdNotAllowedError)
    })

    test('chainId', () => {
      const [store, actions] = createWeb3ReactStoreAndActions()
      const chainId = 1
      actions.update({ chainId })
      expect(store.getState()).toEqual({
        chainId,
        accounts: undefined,
        activating: false,
        error: undefined,
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
          activating: false,
          error: undefined,
        })
      })

      test('single', () => {
        const [store, actions] = createWeb3ReactStoreAndActions()
        const accounts = ['0x0000000000000000000000000000000000000000']
        actions.update({ accounts })
        expect(store.getState()).toEqual({
          chainId: undefined,
          accounts,
          activating: false,
          error: undefined,
        })
      })

      test('multiple', () => {
        const [store, actions] = createWeb3ReactStoreAndActions()
        const accounts = ['0x0000000000000000000000000000000000000000', '0x0000000000000000000000000000000000000001']
        actions.update({ accounts })
        expect(store.getState()).toEqual({
          chainId: undefined,
          accounts,
          activating: false,
          error: undefined,
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
        activating: false,
        error: undefined,
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
        activating: true,
        error: undefined,
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
        activating: true,
        error: undefined,
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
        activating: false,
        error: undefined,
      })
    })

    test('error is cleared', () => {
      const [store, actions] = createWeb3ReactStoreAndActions()
      const chainId = 1
      const accounts: string[] = []
      actions.reportError(new Error())
      actions.update({ chainId, accounts })
      expect(store.getState()).toEqual({
        chainId,
        accounts,
        activating: false,
        error: undefined,
      })
    })
  })

  test('#reportError', () => {
    const [store, actions] = createWeb3ReactStoreAndActions()
    const error = new Error()
    actions.reportError(error)
    expect(store.getState()).toEqual({
      chainId: undefined,
      accounts: undefined,
      activating: false,
      error,
    })
  })
})
