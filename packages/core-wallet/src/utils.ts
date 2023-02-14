import { Provider } from '@web3-react/types'

export type CoreWalletProvider = Provider & {
  isAvalanche?: boolean
  isConnected?: () => boolean
  providers?: CoreWalletProvider[]
}

interface Window {
  ethereum?: CoreWalletProvider
  avalanche?: CoreWalletProvider
}

export interface DetectCoreWalletProviderOptions {
  silent?: boolean
  timeout?: number
}

/**
 * Returns a Promise that resolves to the value of window.ethereum or window.avalanche
 * if it is set with the Core Wallet provider within the given timeout, or null.
 * The Promise will not reject, but an error will be thrown if invalid options
 * are provided.
 *
 * @param options - Options bag.
 * @param options.silent - Whether to silence console errors. Does not affect
 * thrown errors. Default: false
 * @param options.timeout - Milliseconds to wait for 'ethereum#initialized' to
 * be dispatched. Default: 3000
 * @returns A Promise that resolves with the Provider if it is detected within
 * given timeout, otherwise null.
 */
export function detectCoreWalletProvider<T = CoreWalletProvider>({
  silent = false,
  timeout = 3000,
}: DetectCoreWalletProviderOptions = {}): Promise<T | null> {
  let handled = false

  return new Promise((resolve) => {
    if ((window as Window).ethereum || (window as Window).avalanche) {
      handleProvider()
    } else {
      window.addEventListener('avalanche#initialized', handleProvider, { once: true })

      setTimeout(() => {
        handleProvider()
      }, timeout)
    }

    function handleProvider() {
      if (handled) {
        return
      }
      handled = true

      window.removeEventListener('avalanche#initialized', handleProvider)

      const { ethereum, avalanche } = window as Window

      if (ethereum && ethereum.isAvalanche) {
        resolve(ethereum as unknown as T)
      } else if (avalanche && avalanche.isAvalanche) {
        resolve(avalanche as unknown as T)
      } else {
        const message = avalanche ? 'Non-CoreWallet window.avalanche detected.' : 'Unable to detect window.avalanche.'

        !silent && console.error('detectCoreWalletProvider:', message)
        resolve(null)
      }
    }
  })
}
