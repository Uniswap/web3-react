// Not available in the `node` environment, but required by WalletConnect
global.TextEncoder = jest.fn()
global.TextDecoder = jest.fn()

import { EthereumProvider } from '@walletconnect/ethereum-provider'
import { MockEIP1193Provider } from '@web3-react/core'
import { createWeb3ReactStoreAndActions } from '@web3-react/store'
import { RequestArguments } from '@web3-react/types'

import { WalletConnect, WalletConnectOptions } from '.'

type EthereumProviderOptions = Parameters<typeof EthereumProvider.init>[0]

const createTestEnvironment = (
  opts: Omit<WalletConnectOptions, 'projectId' | 'showQrModal'>,
  defaultChainId?: number
) => {
  const [store, actions] = createWeb3ReactStoreAndActions()
  const connector = new WalletConnect({
    actions,
    defaultChainId,
    options: { ...opts, projectId: '', showQrModal: false },
  })
  return { connector, store }
}

const chains = [1, 2, 3]

type SwitchEthereumChainRequestArguments = {
  method: 'wallet_switchEthereumChain'
  params: [{ chainId: string }]
}

const isSwitchEthereumChainRequest = (x: RequestArguments): x is SwitchEthereumChainRequestArguments => {
  return x.method === 'wallet_switchEthereumChain'
}

class MockWalletConnectProvider extends MockEIP1193Provider<number> {
  opts: EthereumProviderOptions

  constructor(opts: EthereumProviderOptions) {
    super()
    if (opts.chains && opts.chains.length > 0) {
      this.chainId = opts.chains[0]
    } else if (opts.optionalChains && opts.optionalChains.length > 0) {
      this.chainId = opts.optionalChains[0]
    }
    this.opts = opts
  }

  /** per {@link https://eips.ethereum.org/EIPS/eip-3326#specification EIP-3326} */
  public eth_switchEthereumChain = jest.fn(
    (/* eslint-disable-line @typescript-eslint/no-unused-vars */ _args: string) => null
  )

  public request(x: RequestArguments | SwitchEthereumChainRequestArguments): Promise<unknown> {
    if (isSwitchEthereumChainRequest(x)) {
      this.chainId = parseInt(x.params[0].chainId, 16)
      this.emit('chainChanged', this.chainId)
      return Promise.resolve(this.eth_switchEthereumChain(JSON.stringify(x)))
    } else {
      return super.request(x)
    }
  }

  public enable() {
    return super.request({ method: 'eth_requestAccounts' })
  }

  /**
   * For testing purposes, let's assume we're connected to all required and optional chains.
   * We mock this method later in the test suite to test behavior when optional chains are not supported.
   */
  public getConnectedChains() {
    return (this.opts.chains || []).concat(this.opts.optionalChains || [])
  }

  // session is an object when connected, undefined otherwise
  get session() {
    return this.eth_requestAccounts.mock.calls.length > 0
      ? {
          // We read `accounts` to check what chains from `optionalChains` did we connect to
          namespaces: {
            eip155: {
              accounts: this.getConnectedChains().map((chainId) => `eip155:${chainId}:0x1`),
            },
          },
        }
      : undefined
  }

  public disconnect() {
    return this
  }
}

describe('WalletConnect', () => {
  let wc2InitMock: jest.SpyInstance<ReturnType<typeof EthereumProvider.init>, Parameters<typeof EthereumProvider.init>>;

  beforeEach(() => {
    /*
     * TypeScript error is expected here. We're mocking a factory `init` method
     * to only define a subset of `EthereumProvider` that we use internally
     */
    wc2InitMock = jest
      .spyOn(EthereumProvider, 'init')
      // @ts-expect-error
      .mockImplementation((opts) => Promise.resolve(new MockWalletConnectProvider(opts)))
  })

  describe('#connectEagerly', () => {
    test('should fail when no existing session', async () => {
      const { connector } = createTestEnvironment({ chains })
      await expect(connector.connectEagerly()).rejects.toThrow()
    })
  })

  describe(`#isomorphicInitialize`, () => {
    test('should initialize exactly one provider and return a Promise if pending initialization', async () => {
      const { connector } = createTestEnvironment({ chains })
      connector.activate()
      connector.activate()
      expect(wc2InitMock).toHaveBeenCalledTimes(1)
      wc2InitMock.mockClear()
    })
    test('should be able to initialize with only optionalChains', async () => {
      const { connector } = createTestEnvironment({ chains: undefined, optionalChains: chains })
      connector.activate()
      connector.activate()
      expect(wc2InitMock).toHaveBeenCalledTimes(1)
      wc2InitMock.mockClear()
    })
  })

  describe('#activate', () => {
    test('should take first chain as default', async () => {
      const { connector, store } = createTestEnvironment({ chains })
      await connector.activate()
      expect(store.getState().chainId).toEqual(chains[0])
    })

    test('should use `defaultChainId` when passed', async () => {
      const { connector, store } = createTestEnvironment({ chains }, 3)
      await connector.activate()
      expect(store.getState().chainId).toEqual(3)
    })

    test('should prefer argument over `defaultChainId`', async () => {
      const { connector, store } = createTestEnvironment({ chains }, 3)
      await connector.activate(2)
      expect(store.getState().chainId).toEqual(2)
    })

    test('should throw an error when activating with an unknown chain', async () => {
      const { connector } = createTestEnvironment({ chains })
      await expect(connector.activate(99)).rejects.toThrow()
    })

    test('should throw an error when using optional chain as default', () => {
      expect(() => createTestEnvironment({ chains, optionalChains: [8] }, 8)).toThrow('Invalid chainId 8. Make sure default chain is included in "chains" - chains specified in "optionalChains" may not be selected as the default, as they may not be supported by the wallet.')
    })


    test('should switch to an optional chain', async () => {
      const { connector, store } = createTestEnvironment({
        chains,
        optionalChains: [8],
      })
      await connector.activate()
      await connector.activate(8)
      expect(store.getState().chainId).toEqual(8)
    })

    test('should throw an error when activating an inactive optional chain', async () => {
      jest.spyOn(MockWalletConnectProvider.prototype, 'getConnectedChains').mockReturnValue(chains)
      const { connector } = createTestEnvironment({
        chains,
        optionalChains: [8],
      })
      await connector.activate()
      await expect(connector.activate(8)).rejects.toThrow()
    })

    test('should switch chain', async () => {
      const { connector, store } = createTestEnvironment({ chains })
      await connector.activate()
      expect(store.getState().chainId).toEqual(1)
      await connector.activate(2)
      expect(store.getState().chainId).toEqual(2)
    })

    test('should not switch chain if already connected', async () => {
      const { connector } = createTestEnvironment({ chains })
      await connector.activate(2)
      await connector.activate(2)
      expect(
        (connector.provider as unknown as MockWalletConnectProvider).eth_switchEthereumChain
      ).toHaveBeenCalledTimes(0)
    })
  })
})
