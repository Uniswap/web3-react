import type { Connector, Provider } from '@web3-react/types'
import { useCallback, useEffect, useRef, useState } from 'react'

export interface ConnectionMonitorOptions {
  /** Milliseconds between health checks (default: 30000) */
  checkInterval?: number
  /** Health check timeout in milliseconds (default: 5000) */
  timeout?: number
  /** Maximum automatic reconnection attempts (default: 3) */
  maxRetries?: number
  /** Enable/disable monitoring (default: true) */
  enabled?: boolean
  /** Called when connection becomes stale */
  onStale?: () => void
  /** Called when connection recovers */
  onRecover?: () => void
  /** Called on health check errors */
  onError?: (error: Error) => void
}

export interface ConnectionMonitorState {
  /** Current connection health status */
  isHealthy: boolean
  /** Timestamp of last health check */
  lastChecked: Date | null
  /** Count of consecutive failed checks */
  consecutiveFailures: number
  /** Manually trigger reconnection */
  reconnect: () => Promise<void>
  /** Reset failure counter */
  reset: () => void
}

interface PendingRequest {
  method: string
  promise: Promise<unknown>
  timestamp: number
}

/**
 * Hook for monitoring connection health and preventing duplicate requests
 * @param connector - The web3-react connector to monitor
 * @param provider - The provider instance (optional)
 * @param options - Configuration options
 */
export function useConnectionMonitor(
  connector: Connector | undefined,
  provider?: Provider,
  options: ConnectionMonitorOptions = {}
): ConnectionMonitorState {
  const { checkInterval = 30000, timeout = 5000, maxRetries = 3, enabled = true, onStale, onRecover, onError } = options

  const [isHealthy, setIsHealthy] = useState(true)
  const [lastChecked, setLastChecked] = useState<Date | null>(null)
  const [consecutiveFailures, setConsecutiveFailures] = useState(0)

  // Use refs to store mutable values without causing re-renders
  const healthCheckTimerRef = useRef<NodeJS.Timeout | null>(null)
  const pendingRequestsRef = useRef<Map<string, PendingRequest>>(new Map())
  const isReconnectingRef = useRef(false)
  const mountedRef = useRef(true)

  /**
   * Deduplicate requests - if same method is already pending, return existing promise
   */
  const deduplicatedRequest = useCallback(
    async (providerInstance: Provider, method: string, params?: unknown[]): Promise<unknown> => {
      const key = `${method}:${JSON.stringify(params || [])}`
      const existing = pendingRequestsRef.current.get(key)

      // Return existing promise if request is still pending and not too old (< 30s)
      if (existing && Date.now() - existing.timestamp < 30000) {
        return existing.promise
      }

      // Create new promise and store it
      const promise = providerInstance.request({ method, params })
      pendingRequestsRef.current.set(key, {
        method,
        promise,
        timestamp: Date.now(),
      })

      // Clean up after completion
      promise
        .finally(() => {
          if (mountedRef.current) {
            pendingRequestsRef.current.delete(key)
          }
        })
        .catch(() => {
          // Errors handled by caller
        })

      return promise
    },
    []
  )

  /**
   * Perform a health check with timeout
   */
  const performHealthCheck = useCallback(async (): Promise<boolean> => {
    if (!connector || (!provider && !connector.provider)) {
      return false
    }

    const providerInstance = provider || connector.provider

    if (!providerInstance) {
      return false
    }

    try {
      // Create a timeout promise
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Health check timeout')), timeout)
      })

      // Race between health check and timeout
      await Promise.race([deduplicatedRequest(providerInstance, 'eth_chainId'), timeoutPromise])

      return true
    } catch (error) {
      if (mountedRef.current && onError) {
        onError(error instanceof Error ? error : new Error('Health check failed'))
      }
      return false
    }
  }, [connector, provider, timeout, deduplicatedRequest, onError])

  /**
   * Reset failure counter
   */
  const reset = useCallback(() => {
    setConsecutiveFailures(0)
    setIsHealthy(true)
  }, [])

  /**
   * Attempt to reconnect with exponential backoff
   */
  const reconnect = useCallback(async (): Promise<void> => {
    if (!connector || isReconnectingRef.current) {
      return
    }

    isReconnectingRef.current = true

    try {
      // If connector has connectEagerly, use it for reconnection
      if ('connectEagerly' in connector && typeof connector.connectEagerly === 'function') {
        await connector.connectEagerly()
      } else if ('activate' in connector && typeof connector.activate === 'function') {
        await connector.activate()
      }

      if (mountedRef.current) {
        setIsHealthy(true)
        setConsecutiveFailures(0)
        if (onRecover) {
          onRecover()
        }
      }
    } catch (error) {
      if (mountedRef.current && onError) {
        onError(error instanceof Error ? error : new Error('Reconnection failed'))
      }
    } finally {
      isReconnectingRef.current = false
    }
  }, [connector, onRecover, onError])

  /**
   * Main health check loop with automatic recovery
   */
  const runHealthCheck = useCallback(async () => {
    if (!enabled || !mountedRef.current) {
      return
    }

    const healthy = await performHealthCheck()

    if (!mountedRef.current) {
      return
    }

    setLastChecked(new Date())

    if (healthy) {
      if (!isHealthy && onRecover) {
        onRecover()
      }
      setIsHealthy(true)
      setConsecutiveFailures(0)
    } else {
      const newFailureCount = consecutiveFailures + 1
      setConsecutiveFailures(newFailureCount)
      setIsHealthy(false)

      // Call onStale only on first failure
      if (newFailureCount === 1 && onStale) {
        onStale()
      }

      // Attempt automatic reconnection if within retry limit
      if (newFailureCount <= maxRetries && !isReconnectingRef.current) {
        // Exponential backoff: 2s, 4s, 8s
        const backoffDelay = Math.min(1000 * Math.pow(2, newFailureCount), 8000)

        setTimeout(() => {
          if (mountedRef.current) {
            void reconnect()
          }
        }, backoffDelay)
      }
    }
  }, [enabled, performHealthCheck, isHealthy, consecutiveFailures, maxRetries, onStale, onRecover, reconnect])

  // Set up periodic health checks
  useEffect(() => {
    if (!enabled || !connector) {
      return
    }

    // Initial health check
    void runHealthCheck()

    // Set up interval for periodic checks
    healthCheckTimerRef.current = setInterval(() => {
      void runHealthCheck()
    }, checkInterval)

    // Cleanup function
    return () => {
      if (healthCheckTimerRef.current) {
        clearInterval(healthCheckTimerRef.current)
        healthCheckTimerRef.current = null
      }
    }
  }, [enabled, connector, checkInterval, runHealthCheck])

  // Cleanup on unmount
  useEffect(() => {
    const pendingRequests = pendingRequestsRef.current
    return () => {
      mountedRef.current = false
      if (healthCheckTimerRef.current) {
        clearInterval(healthCheckTimerRef.current)
      }
      // Clear all pending requests on unmount
      pendingRequests.clear()
    }
  }, [])

  return {
    isHealthy,
    lastChecked,
    consecutiveFailures,
    reconnect,
    reset,
  }
}
