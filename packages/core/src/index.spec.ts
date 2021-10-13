import {
  initializeConnector,
  useChainId,
  useAccounts,
  useAccount,
  useActivating,
  useError,
  useProvider,
  useENSNames,
  useENSName,
} from './'
import { Connector, Actions, Web3ReactState } from '@web3-react/types'
import { renderHook } from '@testing-library/react-hooks'
import { UseStore } from 'zustand'

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
  let useConnector: UseStore<Web3ReactState>

  beforeEach(() => {
    ;[connector, useConnector] = initializeConnector((actions) => new MockConnector(actions))
  })

  // #useChainId
  afterEach(() => {
    const { result } = renderHook(() => useConnector())
    const {
      result: { current: chainId },
    } = renderHook(() => useChainId(useConnector))
    expect(result.current.chainId).toBe(chainId)
  })

  // #useAccounts
  // #useAccount
  afterEach(() => {
    const { result } = renderHook(() => useConnector())
    const {
      result: { current: accounts },
    } = renderHook(() => useAccounts(useConnector))
    expect(result.current.accounts).toEqual(accounts)
    const {
      result: { current: account },
    } = renderHook(() => useAccount(useConnector))
    expect(result.current.accounts?.[0]).toBe(account)
  })

  // #useActivating
  afterEach(() => {
    const { result } = renderHook(() => useConnector())
    const {
      result: { current: activating },
    } = renderHook(() => useActivating(useConnector))
    expect(result.current.activating).toEqual(activating)
  })

  // #useActivating
  afterEach(() => {
    const { result } = renderHook(() => useConnector())
    const {
      result: { current: error },
    } = renderHook(() => useError(useConnector))
    expect(result.current.error).toEqual(error)
  })

  test('initialized', () => {
    expect(connector).toBeInstanceOf(Connector)
    expect(connector).toBeInstanceOf(MockConnector)

    const {
      result: { current },
    } = renderHook(() => useConnector())
    expect(current).toEqual({
      chainId: undefined,
      accounts: undefined,
      activating: false,
      error: undefined,
    })
  })

  test('chainId', () => {
    connector.update({ chainId: 1 })
  })

  test('accounts (empty)', () => {
    connector.update({ accounts: [] })
  })

  test('accounts (single)', () => {
    connector.update({ accounts: ['0x0000000000000000000000000000000000000000'] })
  })

  test('accounts (empty)', () => {
    connector.update({
      accounts: ['0x0000000000000000000000000000000000000000', '0x0000000000000000000000000000000000000001'],
    })
  })

  test('activating', () => {
    connector.activate()
  })

  test('error', () => {
    connector.reportError(new Error())
  })

  // TODO actually test this
  test('#useProvider', () => {
    const {
      result: { current: provider },
    } = renderHook(() => useProvider(connector, useConnector))
    expect(provider).toBe(undefined)
  })

  // TODO actually test this
  test('#useENSNames', () => {
    const {
      result: { current: names },
    } = renderHook(() => useENSNames(connector, useConnector))
    expect(names).toBe(undefined)
  })

  // TODO actually test this
  test('#useENSName', () => {
    const {
      result: { current: name },
    } = renderHook(() => useENSName(connector, useConnector))
    expect(name).toBe(undefined)
  })
})
