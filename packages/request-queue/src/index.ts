import type { Provider, RequestArguments } from '@web3-react/types'

interface QueuedRequest {
  args: RequestArguments
  resolve: (value: unknown) => void
  reject: (reason: Error) => void
  timestamp: number
  priority: number
}

/**
 * Critical methods that should have higher priority and prevent concurrent execution
 */
const CRITICAL_METHODS = new Set([
  'eth_requestAccounts',
  'wallet_requestPermissions',
  'wallet_switchEthereumChain',
  'wallet_addEthereumChain',
  'personal_sign',
  'eth_signTypedData_v4',
  'eth_sendTransaction',
])

/**
 * Methods that can be safely deduplicated if identical requests are pending
 */
const DEDUPLICATABLE_METHODS = new Set([
  'eth_chainId',
  'eth_accounts',
  'eth_blockNumber',
  'eth_getBalance',
  'eth_getCode',
])

export class RequestQueue {
  private provider: Provider
  private queue: QueuedRequest[] = []
  private isProcessing = false
  private pendingRequests = new Map<string, Promise<unknown>>()

  // Track active critical requests to prevent concurrent execution
  private activeCriticalRequest: QueuedRequest | null = null

  constructor(provider: Provider) {
    this.provider = provider
  }

  /**
   * Generate a unique key for deduplication
   */
  private getRequestKey(args: RequestArguments): string {
    return `${args.method}:${JSON.stringify(args.params || [])}`
  }

  /**
   * Check if request can be deduplicated
   */
  private canDeduplicate(args: RequestArguments): boolean {
    return DEDUPLICATABLE_METHODS.has(args.method)
  }

  /**
   * Check if request is critical and needs exclusive execution
   */
  private isCritical(args: RequestArguments): boolean {
    return CRITICAL_METHODS.has(args.method)
  }

  /**
   * Get priority for a request (higher number = higher priority)
   */
  private getPriority(args: RequestArguments): number {
    // Critical methods get highest priority
    if (CRITICAL_METHODS.has(args.method)) {
      return 100
    }

    // Read operations get medium priority
    if (args.method.startsWith('eth_get') || args.method.startsWith('eth_call')) {
      return 50
    }

    // Everything else gets normal priority
    return 10
  }

  /**
   * Enqueue a request
   */
  public async request<T = unknown>(args: RequestArguments): Promise<T> {
    // Check if we can deduplicate this request
    if (this.canDeduplicate(args)) {
      const key = this.getRequestKey(args)
      const existing = this.pendingRequests.get(key)
      if (existing) {
        return existing as Promise<T>
      }
    }

    return new Promise<T>((resolve, reject) => {
      const queuedRequest: QueuedRequest = {
        args,
        resolve: resolve as (value: unknown) => void,
        reject,
        timestamp: Date.now(),
        priority: this.getPriority(args),
      }

      // Add to queue
      this.queue.push(queuedRequest)

      // Sort by priority (highest first), then by timestamp (oldest first)
      this.queue.sort((a, b) => {
        if (a.priority !== b.priority) {
          return b.priority - a.priority
        }
        return a.timestamp - b.timestamp
      })

      // Start processing if not already
      if (!this.isProcessing) {
        void this.processQueue()
      }
    })
  }

  /**
   * Process the request queue
   */
  private async processQueue(): Promise<void> {
    if (this.isProcessing || this.queue.length === 0) {
      return
    }

    this.isProcessing = true

    while (this.queue.length > 0) {
      const request = this.queue[0]

      // If there's an active critical request and this is also critical, wait
      if (this.isCritical(request.args) && this.activeCriticalRequest) {
        // Wait a bit before checking again
        await new Promise((resolve) => setTimeout(resolve, 100))
        continue
      }

      // Remove from queue
      this.queue.shift()

      // Mark as active critical if applicable
      if (this.isCritical(request.args)) {
        this.activeCriticalRequest = request
      }

      // Execute the request
      try {
        const key = this.getRequestKey(request.args)
        const promise = this.provider.request(request.args)

        // Store for deduplication
        if (this.canDeduplicate(request.args)) {
          this.pendingRequests.set(key, promise)
        }

        const result = await promise

        // Clean up
        if (this.canDeduplicate(request.args)) {
          this.pendingRequests.delete(key)
        }

        // Mark critical as complete
        if (this.activeCriticalRequest === request) {
          this.activeCriticalRequest = null
        }

        request.resolve(result)
      } catch (error) {
        // Clean up on error
        const key = this.getRequestKey(request.args)
        this.pendingRequests.delete(key)

        // Mark critical as complete
        if (this.activeCriticalRequest === request) {
          this.activeCriticalRequest = null
        }

        request.reject(error instanceof Error ? error : new Error(String(error)))
      }

      // Small delay between requests to prevent overwhelming the provider
      await new Promise((resolve) => setTimeout(resolve, 10))
    }

    this.isProcessing = false
  }

  /**
   * Clear the queue and reject all pending requests
   */
  public clear(reason?: string): void {
    const error = new Error(reason || 'Request queue cleared')

    // Reject all queued requests
    while (this.queue.length > 0) {
      const request = this.queue.shift()
      if (request) {
        request.reject(error)
      }
    }

    // Clear pending deduplicated requests
    this.pendingRequests.clear()

    // Reset state
    this.activeCriticalRequest = null
    this.isProcessing = false
  }

  /**
   * Get queue statistics
   */
  public getStats() {
    return {
      queueLength: this.queue.length,
      pendingDeduplicatedRequests: this.pendingRequests.size,
      isProcessing: this.isProcessing,
      hasCriticalRequest: this.activeCriticalRequest !== null,
    }
  }
}

/**
 * Wrap a provider with request queuing
 */
export function createQueuedProvider(provider: Provider): Provider {
  const queue = new RequestQueue(provider)

  return {
    request: (args: RequestArguments) => queue.request(args),
    on: provider.on.bind(provider),
    removeListener: provider.removeListener.bind(provider),
  }
}
