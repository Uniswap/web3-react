interface BitKeepEthereumProvider {
  isBitKeep?: boolean;
  once(eventName: string | symbol, listener: (...args: any[]) => void): this;
  on(eventName: string | symbol, listener: (...args: any[]) => void): this;
  off(eventName: string | symbol, listener: (...args: any[]) => void): this;
  addListener(eventName: string | symbol, listener: (...args: any[]) => void): this;
  removeListener(eventName: string | symbol, listener: (...args: any[]) => void): this;
  removeAllListeners(event?: string | symbol): this;
}

interface Window {
  bitkeep?: {
    ethereum?: BitKeepEthereumProvider;
  }
}

export = detectEthereumProvider;

/**
 * Returns a Promise that resolves to the value of window.ethereum if it is
 * set within the given timeout, or null.
 * The Promise will not reject, but an error will be thrown if invalid options
 * are provided.
 *
 * @param options - Options bag.
 * @param options.mustBeBitKeep - Whether to only look for BitKeep providers.
 * Default: false
 * @param options.silent - Whether to silence console errors. Does not affect
 * thrown errors. Default: false
 * @param options.timeout - Milliseconds to wait for 'ethereum#initialized' to
 * be dispatched. Default: 3000
 * @returns A Promise that resolves with the Provider if it is detected within
 * given timeout, otherwise null.
 */
function detectEthereumProvider<T = BitKeepEthereumProvider>({
  mustBeBitKeep = false,
  silent = false,
  timeout = 3000,
} = {}): Promise<T | null> {

  _validateInputs();

  let handled = false;

  return new Promise((resolve) => {
    if ((window as Window)?.bitkeep?.ethereum) {

      handleEthereum();

    } else {

      window.addEventListener(
        'ethereum#initialized',
        handleEthereum,
        { once: true },
      );

      setTimeout(() => {
        handleEthereum();
      }, timeout);
    }

    function handleEthereum() {

      if (handled) {
        return;
      }
      handled = true;

      window.removeEventListener('ethereum#initialized', handleEthereum);

      const { bitkeep } = (window as Window);

      if (bitkeep?.ethereum && (!mustBeBitKeep ||bitkeep. ethereum.isBitKeep)) {
        resolve(bitkeep.ethereum as unknown as T);
      } else {

        const message = mustBeBitKeep && bitkeep?.ethereum
          ? 'Non-BitKeep window.bitkeep.ethereum detected.'
          : 'Unable to detect window.bitkeep.ethereum.';

        !silent && console.error('detect-provider:', message);
        resolve(null);
      }
    }
  });

  function _validateInputs() {
    if (typeof mustBeBitKeep !== 'boolean') {
      throw new Error(`detect-provider: Expected option 'mustBeBitKeep' to be a boolean.`);
    }
    if (typeof silent !== 'boolean') {
      throw new Error(`detect-provider: Expected option 'silent' to be a boolean.`);
    }
    if (typeof timeout !== 'number') {
      throw new Error(`detect-provider: Expected option 'timeout' to be a number.`);
    }
  }
}