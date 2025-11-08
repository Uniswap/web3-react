import { renderHook, act } from '@testing-library/react-hooks'
import type { Connector, Provider } from '@web3-react/types'
import { useConnectionMonitor } from './index'

// Mock provider
class MockProvider {
  private shouldFail = false
  private requestDelay = 0

  request({ method }: { method: string; params?: unknown[] }): Promise<unknown> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (this.shouldFail) {
          reject(new Error('Provider error'))
        } else {
          if (method === 'eth_chainId') {
            resolve('0x1')
          } else {
            resolve([])
          }
        }
      }, this.requestDelay)
    })
  }

  setShouldFail(fail: boolean) {
    this.shouldFail = fail
  }

  setDelay(delay: number) {
    this.requestDelay = delay
  }

  on() {
    return this
  }

  removeListener() {
    return this
  }
}

// Mock connector
class MockConnector {
  provider: Provider
  connectEagerlyCalled = false
  activateCalled = false

  constructor(provider: Provider) {
    this.provider = provider
  }

  async connectEagerly() {
    this.connectEagerlyCalled = true
  }

  async activate() {
    this.activateCalled = true
  }
}

describe('useConnectionMonitor', () => {
  let mockProvider: MockProvider
  let mockConnector: MockConnector

  beforeEach(() => {
    jest.useFakeTimers()
    mockProvider = new MockProvider()
    mockConnector = new MockConnector(mockProvider as unknown as Provider)
  })

  afterEach(() => {
    jest.clearAllTimers()
    jest.useRealTimers()
  })

  test('should initialize with healthy state', async () => {
    const { result } = renderHook(() =>
      useConnectionMonitor(mockConnector as unknown as Connector, mockProvider as unknown as Provider, {
        enabled: false, // Disable to prevent automatic checks during test setup
      })
    )

    expect(result.current.isHealthy).toBe(true)
    expect(result.current.consecutiveFailures).toBe(0)
    expect(result.current.lastChecked).toBe(null)
  })

  test('should perform health check and update state', async () => {
    const { result } = renderHook(() =>
      useConnectionMonitor(mockConnector as unknown as Connector, mockProvider as unknown as Provider, {
        checkInterval: 10000,
      })
    )

    // Wait for initial health check
    await act(async () => {
      jest.advanceTimersByTime(100)
    })

    expect(result.current.isHealthy).toBe(true)
    expect(result.current.lastChecked).not.toBe(null)
  })

  test('should detect stale connection', async () => {
    const onStale = jest.fn()
    
    const { result } = renderHook(() =>
      useConnectionMonitor(mockConnector as unknown as Connector, mockProvider as unknown as Provider, {
        checkInterval: 5000,
        timeout: 1000,
        onStale,
      })
    )

    // Wait for initial check to complete
    await act(async () => {
      jest.advanceTimersByTime(100)
    })

    // Make provider fail
    mockProvider.setShouldFail(true)

    // Trigger next health check
    await act(async () => {
      jest.advanceTimersByTime(5000)
    })

    expect(result.current.isHealthy).toBe(false)
    expect(result.current.consecutiveFailures).toBe(1)
    expect(onStale).toHaveBeenCalledTimes(1)
  })

  test('should call onRecover when connection recovers', async () => {
    const onRecover = jest.fn()
    
    const { result } = renderHook(() =>
      useConnectionMonitor(mockConnector as unknown as Connector, mockProvider as unknown as Provider, {
        checkInterval: 5000,
        onRecover,
      })
    )

    // Initial check
    await act(async () => {
      jest.advanceTimersByTime(100)
    })

    // Make provider fail
    mockProvider.setShouldFail(true)
    await act(async () => {
      jest.advanceTimersByTime(5000)
    })

    expect(result.current.isHealthy).toBe(false)

    // Recover provider
    mockProvider.setShouldFail(false)
    await act(async () => {
      jest.advanceTimersByTime(5000)
    })

    expect(result.current.isHealthy).toBe(true)
    expect(onRecover).toHaveBeenCalled()
  })

  test('should handle timeout on slow provider', async () => {
    const onError = jest.fn()
    
    mockProvider.setDelay(6000) // Delay longer than timeout

    const { result } = renderHook(() =>
      useConnectionMonitor(mockConnector as unknown as Connector, mockProvider as unknown as Provider, {
        checkInterval: 10000,
        timeout: 1000,
        onError,
      })
    )

    await act(async () => {
      jest.advanceTimersByTime(2000)
    })

    expect(result.current.isHealthy).toBe(false)
    expect(onError).toHaveBeenCalled()
  })

  test('should attempt automatic reconnection with backoff', async () => {
    const { result } = renderHook(() =>
      useConnectionMonitor(mockConnector as unknown as Connector, mockProvider as unknown as Provider, {
        checkInterval: 5000,
        maxRetries: 3,
      })
    )

    // Initial check
    await act(async () => {
      jest.advanceTimersByTime(100)
    })

    // Make provider fail
    mockProvider.setShouldFail(true)
    
    // First failure - should trigger reconnect after 2s
    await act(async () => {
      jest.advanceTimersByTime(5000)
    })
    expect(result.current.consecutiveFailures).toBe(1)

    // Wait for reconnect attempt (2s backoff)
    await act(async () => {
      jest.advanceTimersByTime(2000)
    })
    
    expect(mockConnector.connectEagerlyCalled).toBe(true)
  })

  test('should reset failure counter', async () => {
    const { result } = renderHook(() =>
      useConnectionMonitor(mockConnector as unknown as Connector, mockProvider as unknown as Provider, {
        checkInterval: 5000,
      })
    )

    // Make it fail
    mockProvider.setShouldFail(true)
    await act(async () => {
      jest.advanceTimersByTime(5100)
    })

    expect(result.current.consecutiveFailures).toBe(1)
    expect(result.current.isHealthy).toBe(false)

    // Reset
    act(() => {
      result.current.reset()
    })

    expect(result.current.consecutiveFailures).toBe(0)
    expect(result.current.isHealthy).toBe(true)
  })

  test('should manually reconnect', async () => {
    mockProvider.setShouldFail(true)
    
    const { result } = renderHook(() =>
      useConnectionMonitor(mockConnector as unknown as Connector, mockProvider as unknown as Provider, {
        enabled: false, // Disable automatic checks
      })
    )

    await act(async () => {
      await result.current.reconnect()
    })

    expect(mockConnector.connectEagerlyCalled).toBe(true)
  })

  test('should clean up on unmount', () => {
    const { unmount } = renderHook(() =>
      useConnectionMonitor(mockConnector as unknown as Connector, mockProvider as unknown as Provider)
    )

    unmount()

    // Verify no timers are left running
    expect(jest.getTimerCount()).toBe(0)
  })

  test('should deduplicate concurrent requests', async () => {
    const requestSpy = jest.spyOn(mockProvider, 'request')
    
    const { result } = renderHook(() =>
      useConnectionMonitor(mockConnector as unknown as Connector, mockProvider as unknown as Provider, {
        checkInterval: 1000,
      })
    )

    // Trigger multiple concurrent health checks
    await act(async () => {
      jest.advanceTimersByTime(100)
      jest.advanceTimersByTime(100)
      jest.advanceTimersByTime(100)
    })

    // Should only make one request despite multiple checks
    expect(requestSpy).toHaveBeenCalledTimes(1)
  })
})
