import { Web3Provider } from '@ethersproject/providers'
import { act, renderHook } from '@testing-library/react-hooks'
import type { Actions } from '@web3-react/types'
import { Connector } from '@web3-react/types'
import EventEmitter from 'events'
import type { Web3ReactHooks, Web3ReactPriorityHooks, Web3ReactSelectedHooks } from './hooks'
import { getPriorityConnector, getSelectedConnector, initializeConnector } from './hooks'

class MockProvider extends EventEmitter {
  request = jest.fn()
}

class MockConnector extends Connector {
  provider = new MockProvider()

  constructor(actions: Actions) {
    super(actions)
  }
  public activate() {
    this.actions.startActivation()
  }
  public update(...args: Parameters<Actions['update']>) {
    this.actions.update(...args)
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
    const { result } = renderHook(() => hooks.useChainId())
    expect(result.current).toBe(undefined)

    act(() => connector.update({ chainId: 1 }))
    expect(result.current).toBe(1)
  })

  describe('#useAccounts', () => {
    test('empty', () => {
      const { result } = renderHook(() => hooks.useAccounts())
      expect(result.current).toBe(undefined)

      act(() => connector.update({ accounts: [] }))
      expect(result.current).toEqual([])
    })

    test('single', () => {
      const { result } = renderHook(() => hooks.useAccounts())
      expect(result.current).toBe(undefined)

      act(() => connector.update({ accounts: ['0x0000000000000000000000000000000000000000'] }))
      expect(result.current).toEqual(['0x0000000000000000000000000000000000000000'])
    })

    test('multiple', () => {
      const { result } = renderHook(() => hooks.useAccounts())
      expect(result.current).toBe(undefined)

      act(() =>
        connector.update({
          accounts: ['0x0000000000000000000000000000000000000000', '0x0000000000000000000000000000000000000001'],
        })
      )
      expect(result.current).toEqual([
        '0x0000000000000000000000000000000000000000',
        '0x0000000000000000000000000000000000000001',
      ])
    })
  })

  test('#useIsActivating', () => {
    const { result } = renderHook(() => hooks.useIsActivating())
    expect(result.current).toBe(false)

    act(() => connector.activate())
    expect(result.current).toEqual(true)
  })

  test('#useIsActive', () => {
    const { result } = renderHook(() => hooks.useIsActive())
    expect(result.current).toBe(false)

    act(() => connector.update({ chainId: 1, accounts: [] }))
    expect(result.current).toEqual(true)
  })

  describe('#useProvider', () => {
    test('lazy loads Web3Provider and rerenders', async () => {
      act(() => connector.update({ chainId: 1, accounts: [] }))

      const { result, waitForNextUpdate } = renderHook(() => hooks.useProvider())
      expect(result.current).toBeUndefined()
      await waitForNextUpdate()
      expect(result.current).toBeInstanceOf(Web3Provider)
    })
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
