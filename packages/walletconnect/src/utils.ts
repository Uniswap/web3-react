/**
 * @param urls - An array of URLs to try to connect to.
 * @param timeout - How long to wait before a call is considered failed, in ms.
 */
export async function getBestUrl(urls: string[], timeout: number): Promise<string> {
  // if we only have 1 url, it's the best!
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
