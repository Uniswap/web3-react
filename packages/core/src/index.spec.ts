import { act, renderHook } from '@testing-library/react-hooks'
import type { Actions } from '@web3-react/types'
import { Connector } from '@web3-react/types'
import { initializeConnector, Web3ReactHooks } from '.'

class MockConnector extends Connector {
  constructor(actions: Actions) {
    super(actions)
  }
  public async activate() {
    this.actions.startActivation()
  }
  public update(...args: Parameters<Actions['update']>) {
    this.actions.update(...args)
  }
  public reportError(...args: Parameters<Actions['reportError']>) {
    this.actions.reportError(...args)
  }
}

describe('#initializeConnector', () => {
  let connector: MockConnector
  let hooks: Web3ReactHooks

  beforeEach(() => {
    ;[connector, hooks] = initializeConnector((actions) => new MockConnector(actions))
  })

  test('#useChainId', () => {
    let {
      result: { current: chainId },
    } = renderHook(() => hooks.useChainId())
    expect(chainId).toBe(undefined)

    act(() => connector.update({ chainId: 1 }))
    ;({
      result: { current: chainId },
    } = renderHook(() => hooks.useChainId()))
    expect(chainId).toBe(1)
  })

  describe('#useAccounts', () => {
    test('empty', async () => {
      let {
        result: { current: accounts },
      } = renderHook(() => hooks.useAccounts())
      expect(accounts).toBe(undefined)

      act(() => connector.update({ accounts: [] }))
      ;({
        result: { current: accounts },
      } = renderHook(() => hooks.useAccounts()))
      expect(accounts).toEqual([])
    })

    test('single', () => {
      let {
        result: { current: accounts },
      } = renderHook(() => hooks.useAccounts())
      expect(accounts).toBe(undefined)

      act(() => connector.update({ accounts: ['0x0000000000000000000000000000000000000000'] }))
      ;({
        result: { current: accounts },
      } = renderHook(() => hooks.useAccounts()))
      expect(accounts).toEqual(['0x0000000000000000000000000000000000000000'])
    })

    test('multiple', () => {
      let {
        result: { current: accounts },
      } = renderHook(() => hooks.useAccounts())
      expect(accounts).toBe(undefined)

      act(() =>
        connector.update({
          accounts: ['0x0000000000000000000000000000000000000000', '0x0000000000000000000000000000000000000001'],
        })
      )
      ;({
        result: { current: accounts },
      } = renderHook(() => hooks.useAccounts()))
      expect(accounts).toEqual([
        '0x0000000000000000000000000000000000000000',
        '0x0000000000000000000000000000000000000001',
      ])
    })
  })

  test('#useIsActivating', async () => {
    let {
      result: { current: activating },
    } = renderHook(() => hooks.useIsActivating())
    expect(activating).toBe(false)

    await act(() => connector.activate())
    ;({
      result: { current: activating },
    } = renderHook(() => hooks.useIsActivating()))
    expect(activating).toEqual(true)
  })

  test('#useError', () => {
    let {
      result: { current: error },
    } = renderHook(() => hooks.useError())
    expect(error).toBe(undefined)

    act(() => connector.reportError(new Error()))
    ;({
      result: { current: error },
    } = renderHook(() => hooks.useError()))
    expect(error).toBeInstanceOf(Error)
  })
})
