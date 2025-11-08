import type { JsonRpcProvider } from '@ethersproject/providers'

/**
 * @param providers - An array of providers to try to connect to.
 * @param timeout - How long to wait before a call is considered failed, in ms.
 */
export async function getBestProvider(providers: JsonRpcProvider[], timeout = 5000): Promise<JsonRpcProvider> {
  // if we only have 1 provider, it's the best!
  if (providers.length === 1) return providers[0]

  // the below returns the first provider for which there's been a successful call, prioritized by index
  return new Promise((resolve, reject) => {
    let resolved = false
    const successes: { [index: number]: boolean } = {}
    const timeouts: NodeJS.Timeout[] = []
    const errors: { [index: number]: Error } = {}

    // Cleanup function to clear all pending timeouts and prevent memory leaks
    const cleanup = () => {
      timeouts.forEach((timeoutId) => clearTimeout(timeoutId))
      timeouts.length = 0
    }

    providers.forEach((provider, i) => {
      // create a promise that resolves on a successful call, and rejects on a failed call or after timeout milliseconds
      const promise = new Promise<void>((resolvePromise, rejectPromise) => {
        let timeoutTriggered = false

        provider
          .getNetwork()
          .then(() => {
            if (!timeoutTriggered) resolvePromise()
          })
          .catch((error) => {
            errors[i] = error
            if (!timeoutTriggered) rejectPromise(error)
          })

        // set a timeout to reject - STORE the timeout ID to clear it later
        const timeoutId = setTimeout(() => {
          timeoutTriggered = true
          errors[i] = new Error(`Provider ${i} connection timeout after ${timeout}ms`)
          rejectPromise(errors[i])
        }, timeout)

        timeouts.push(timeoutId)
      })

      void promise
        .then(() => true)
        .catch(() => false)
        .then((success) => {
          // if we already resolved, return early
          if (resolved) return

          // store the result of the call
          successes[i] = success

          // if this is the last call and we haven't resolved yet - do so
          if (Object.keys(successes).length === providers.length) {
            const index = Object.keys(successes).findIndex((j) => successes[Number(j)])

            // If all providers failed, reject with detailed error information
            if (index === -1) {
              cleanup()
              const errorMessages = Object.entries(errors)
                .map(([idx, err]) => `Provider ${idx}: ${err.message}`)
                .join('; ')
              return reject(new Error(`All providers failed. Errors: ${errorMessages}`))
            }

            // no need to set resolved to true, as this is the last promise
            cleanup()
            return resolve(providers[index])
          }

          // otherwise, for each prospective index, check if we can resolve
          new Array<number>(providers.length).fill(0).forEach((_, prospectiveIndex) => {
            // to resolve, we need to:
            // a) have successfully made a call
            // b) not be waiting on any other higher-index calls
            if (
              successes[prospectiveIndex] &&
              new Array<number>(prospectiveIndex).fill(0).every((_, j) => successes[j] === false)
            ) {
              resolved = true
              cleanup()
              resolve(providers[prospectiveIndex])
            }
          })
        })
    })
  })
}
