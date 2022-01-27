import { act, renderHook } from '@testing-library/react-hooks'
import type { Actions } from '@web3-react/types'
import { Connector } from '@web3-react/types'
import type { Web3ReactHooks, Web3ReactPriorityHooks, Web3ReactSelectedHooks } from '.'
import { getPriorityConnector, getSelectedConnector, initializeConnector } from '.'

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

class MockConnector2 extends MockConnector {}

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

describe('#getSelectedConnector', () => {
  let connector: MockConnector
  let hooks: Web3ReactHooks

  let connector2: MockConnector
  let hooks2: Web3ReactHooks

  let selectedConnectorHooks: Web3ReactSelectedHooks

  beforeEach(() => {
    ;[connector, hooks] = initializeConnector((actions) => new MockConnector(actions))
    ;[connector2, hooks2] = initializeConnector((actions) => new MockConnector2(actions))

    selectedConnectorHooks = getSelectedConnector([connector, hooks], [connector2, hooks2])
  })

  test('isActive is false for connector', () => {
    const {
      result: { current: isActive },
    } = renderHook(() => selectedConnectorHooks.useSelectedIsActive(connector))

    expect(isActive).toBe(false)
  })

  test('isActive is false for connector2', () => {
    const {
      result: { current: isActive },
    } = renderHook(() => selectedConnectorHooks.useSelectedIsActive(connector2))

    expect(isActive).toBe(false)
  })

  test('connector active', () => {
    act(() => connector.update({ chainId: 1, accounts: [] }))
    const {
      result: { current: isActive },
    } = renderHook(() => selectedConnectorHooks.useSelectedIsActive(connector))

    const {
      result: { current: isActive2 },
    } = renderHook(() => selectedConnectorHooks.useSelectedIsActive(connector2))

    expect(isActive).toBe(true)
    expect(isActive2).toBe(false)
  })

  test('connector2 active', () => {
    act(() => connector2.update({ chainId: 1, accounts: [] }))
    const {
      result: { current: isActive },
    } = renderHook(() => selectedConnectorHooks.useSelectedIsActive(connector))

    const {
      result: { current: isActive2 },
    } = renderHook(() => selectedConnectorHooks.useSelectedIsActive(connector2))

    expect(isActive).toBe(false)
    expect(isActive2).toBe(true)
  })
})

describe('#getPriorityConnector', () => {
  let connector: MockConnector
  let hooks: Web3ReactHooks

  let connector2: MockConnector
  let hooks2: Web3ReactHooks

  let priorityConnectorHooks: Web3ReactPriorityHooks

  beforeEach(() => {
    ;[connector, hooks] = initializeConnector((actions) => new MockConnector(actions))
    ;[connector2, hooks2] = initializeConnector((actions) => new MockConnector2(actions))

    priorityConnectorHooks = getPriorityConnector([connector, hooks], [connector2, hooks2])
  })

  test('returns first connector if both are uninitialized', () => {
    const {
      result: { current: priorityConnector },
    } = renderHook(() => priorityConnectorHooks.usePriorityConnector())

    expect(priorityConnector).toBeInstanceOf(MockConnector)
    expect(priorityConnector).not.toBeInstanceOf(MockConnector2)
  })

  test('returns first connector if it is initialized', () => {
    act(() => connector.update({ chainId: 1, accounts: [] }))
    const {
      result: { current: priorityConnector },
    } = renderHook(() => priorityConnectorHooks.usePriorityConnector())

    const {
      result: { current: isActive },
    } = renderHook(() => priorityConnectorHooks.usePriorityIsActive())
    expect(isActive).toBe(true)

    expect(priorityConnector).toBeInstanceOf(MockConnector)
    expect(priorityConnector).not.toBeInstanceOf(MockConnector2)
  })

  test('returns second connector if it is initialized', () => {
    act(() => connector2.update({ chainId: 1, accounts: [] }))
    const {
      result: { current: priorityConnector },
    } = renderHook(() => priorityConnectorHooks.usePriorityConnector())

    const {
      result: { current: isActive },
    } = renderHook(() => priorityConnectorHooks.usePriorityIsActive())
    expect(isActive).toBe(true)

    expect(priorityConnector).toBeInstanceOf(MockConnector2)
  })
})
