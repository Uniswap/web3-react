import { APP_CONFIG, DOWNLOAD_ID } from './const'

/**
 * @param rpcMap - Map of chainIds to rpc url(s).
 * @param timeout - Timeout, in milliseconds, after which to consider network calls failed.
 */
export async function getBestUrlMap(
  rpcMap: Record<string, string | string[]>,
  timeout: number,
): Promise<{ [chainId: string]: string }> {
  return Object.fromEntries(
    await Promise.all(Object.entries(rpcMap).map(async ([chainId, map]) => [chainId, await getBestUrl(map, timeout)])),
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
    throw new Error(
      `Invalid chainId ${defaultChainId}. Make sure default chain is included in "chains" - chains specified in "optionalChains" may not be selected as the default, as they may not be supported by the wallet.`,
    )
  }

  const ordered = [...chains]
  ordered.splice(idx, 1)
  return [defaultChainId, ...ordered]
}

export function walletQrHelpBtnSelector() {
  return document
    ?.querySelector('w3m-modal:last-child')
    ?.shadowRoot?.querySelector('w3m-modal-backcard')
    ?.shadowRoot?.querySelector('.w3m-toolbar div button:first-child')
}
export function walletQrLogoSelector() {
  return document
    ?.querySelector('w3m-modal:last-child')
    ?.shadowRoot?.querySelector('w3m-modal-router')
    ?.shadowRoot?.querySelector('w3m-connect-wallet-view')
    ?.shadowRoot?.querySelector('w3m-desktop-wallet-selection')
    ?.shadowRoot?.querySelector('w3m-modal-content')
    ?.querySelector('w3m-walletconnect-qr')
    ?.shadowRoot?.querySelector('w3m-qrcode')
    ?.shadowRoot?.querySelector('svg')
}

export function walletQrSelector() {
  return document
    ?.querySelector('w3m-modal:last-child')
    ?.shadowRoot?.querySelector('w3m-modal-router')
    ?.shadowRoot?.querySelector('w3m-connect-wallet-view')
    ?.shadowRoot?.querySelector('w3m-desktop-wallet-selection')
    ?.shadowRoot?.querySelector('w3m-modal-content')
}
export function walletFooterSelector() {
  return document
    ?.querySelector('w3m-modal:last-child')
    ?.shadowRoot?.querySelector('w3m-modal-router')
    ?.shadowRoot?.querySelector('w3m-connect-wallet-view')
    ?.shadowRoot?.querySelector('w3m-desktop-wallet-selection')
    ?.shadowRoot?.querySelector('w3m-modal-footer')
}
export function downloadAppButtons() {
  const html = `
  <div ${DOWNLOAD_ID} style="padding:10px 10px 0; text-align:center; font-size: 13px;">
    <div style="font-family: \'SF UI Text\', sans-serif; margin-bottom:5px;">
      <img style="height: 22px; display: inline-block;" src="${APP_CONFIG.logo}" />
      <span style="position:relative; top:-7px;">${APP_CONFIG.name}</span>
    </div>
    <a style="text-decoration:none;" target="_blank" href="${APP_CONFIG.playstore}">
      <img style="height:45px; display:inline; margin:5px 5px 0;" src="https://storage.googleapis.com/ks-setting-1d682dca/c862a973-336e-4609-9bc4-5cc6ddb979d51694891687658.png">
    </a>
    <a style="text-decoration:none;" target="_blank" href="${APP_CONFIG.appstore}">
      <img style="height:45px; display:inline; margin:5px 5px 0;" src="https://storage.googleapis.com/ks-setting-1d682dca/b5bf3e3f-456b-4291-9445-83689a25c5e71694891672546.png">
    </a>
  </div>
  `
  return html
}
export function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Retries the function that returns the promise until the promise successfully resolves up to n retries
 * @param fn function to retry
 * @param n how many times to retry
 * @param minWait min wait between retries in ms
 * @param maxWait max wait between retries in ms
 */
export function retry<T>(
  fn: () => Promise<T>,
  { n, waitTime }: { n: number; waitTime: number },
): { promise: Promise<T>; cancel: () => void } {
  let completed = false
  let rejectCancelled: (error: Error) => void
  const promise = new Promise<T>(async (resolve, reject) => {
    rejectCancelled = reject
    while (true) {
      let result: T
      try {
        result = await fn()
        if (!completed) {
          resolve(result)
          completed = true
        }
        break
      } catch (error) {
        if (completed) {
          break
        }
        if (n <= 0) {
          reject(error)
          completed = true
          break
        }
        n--
      }
      await wait(waitTime)
    }
  })
  return {
    promise,
    cancel: () => {
      if (completed) return
      completed = true
      rejectCancelled(new Error())
    },
  }
}

export const promisify = <T>(fn: () => T): (() => Promise<T>) => {
  return () =>
    new Promise((resolve, rejects) => {
      const result = fn()
      if (result) resolve(result)
      rejects()
    })
}
