/**
 * @param rpcMap - Map of chainIds to rpc url(s).
 * @param timeout - Timeout, in milliseconds, after which to consider network calls failed.
 */
export async function getBestUrlMap(
  rpcMap: Record<string, string | string[]>,
  timeout: number
): Promise<{ [chainId: string]: string }> {
  return Object.fromEntries(
    await Promise.all(Object.entries(rpcMap).map(async ([chainId, map]) => [chainId, await getBestUrl(map, timeout)]))
  )
}

/**
 * @param urls - An array of URLs to try to connect to.
 * @param timeout - {@link getBestUrlMap}
 */
async function getBestUrl(urls: string | string[], timeout: number): Promise<string> {
  // if we only have 1 url, it's the best!
  if (typeof urls === 'string') return urls
  if (urls.length === 1) return urls[0]

  const [HttpConnection, JsonRpcProvider] = await Promise.all([
    import('@walletconnect/jsonrpc-http-connection').then(({ HttpConnection }) => HttpConnection),
    import('@walletconnect/jsonrpc-provider').then(({ JsonRpcProvider }) => JsonRpcProvider),
  ])

  // the below returns the first url for which there's been a successful call, prioritized by index
  return new Promise((resolve) => {
    let resolved = false
    const successes: { [index: number]: boolean } = {}

    urls.forEach((url, i) => {
      const http = new JsonRpcProvider(new HttpConnection(url))

      // create a promise that resolves on a successful call, and rejects on a failed call or after timeout milliseconds
      const promise = new Promise<void>((resolve, reject) => {
        http
          .request({ method: 'eth_chainId' })
          .then(() => resolve())
          .catch(() => reject())

        // set a timeout to reject
        setTimeout(() => {
          reject()
        }, timeout)
      })

      void promise
        .then(() => true)
        .catch(() => false)
        .then((success) => {
          // if we already resolved, return
          if (resolved) return

          // store the result of the call
          successes[i] = success

          // if this is the last call and we haven't resolved yet - do so
          if (Object.keys(successes).length === urls.length) {
            const index = Object.keys(successes).findIndex((j) => successes[Number(j)])
            // no need to set resolved to true, as this is the last promise
            return resolve(urls[index === -1 ? 0 : index])
          }

          // otherwise, for each prospective index, check if we can resolve
          new Array<number>(urls.length).fill(0).forEach((_, prospectiveIndex) => {
            // to resolve, we need to:
            // a) have successfully made a call
            // b) not be waiting on any other higher-index calls
            if (
              successes[prospectiveIndex] &&
              new Array<number>(prospectiveIndex).fill(0).every((_, j) => successes[j] === false)
            ) {
              resolved = true
              resolve(urls[prospectiveIndex])
            }
          })
        })
    })
  })
}

/**
 * @param chains - An array of chain IDs.
 * @param defaultChainId - The chain ID to treat as the default (it will be the first element in the returned array).
 */
export function getChainsWithDefault(chains: number[], defaultChainId: number) {
  const idx = chains.indexOf(defaultChainId)
  if (idx === -1) {
    throw new Error(`Invalid chainId ${defaultChainId}. Make sure to include it in the "chains" array.`)
  }

  const ordered = [...chains]
  ordered.splice(idx, 1)
  return [defaultChainId, ...ordered]
}
