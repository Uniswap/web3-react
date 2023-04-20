// Not avaiable in the `node` environment, but required by WalletConnect
global.TextEncoder = jest.fn()
global.TextDecoder = jest.fn()

// We are not using Web3Modal and it is not available in the `node` environment either
jest.mock('@web3modal/standalone', () => ({ Web3Modal: jest.fn().mockImplementation() }))

import { createWeb3ReactStoreAndActions } from '@web3-react/store'
import { EthereumProvider } from '@walletconnect/ethereum-provider'

import { WalletConnect, WalletConnectOptions } from '.'

const createTestEnvironment = (opts: Omit<WalletConnectOptions, 'projectId'>, defaultChainId?: number) => {
  const [store, actions] = createWeb3ReactStoreAndActions()
  const connector = new WalletConnect({ actions, defaultChainId, options: { ...opts, projectId: '' } })
  return {connector, store}
}

const accounts = ['0x0000000000000000000000000000000000000000']
const chains = [1, 2, 3]

describe('WalletConnect', () => {
  const wc2RequestMock = jest.fn()
  let wc2InitMock: jest.Mock

  beforeEach(() => {
    const wc2EnableMock = jest.fn().mockResolvedValue(accounts)
    /**
     * TypeScript error is expected here. We're mocking a factory `init` method
     * to only define a subset of `EthereumProvider` that we use internally
     */
    // @ts-expect-error
    wc2InitMock = jest.spyOn(EthereumProvider, 'init').mockImplementation(async (opts) => ({
      // We read `accounts` and `chainId` to get current connection state
      accounts,
      chainId: opts.chains[0],
      // Session is an object when connected, undefined otherwise
      get session() {
        return wc2EnableMock.mock.calls.length > 0 ? {
          // We read `accounts` to check what chains from `optionalChains` did we connect to
          namespaces: {
            eip155: {
              // For testing purposes, let's assume we're connected to all required and optional chains
              accounts: opts.chains.concat(opts.optionalChains || []).map((chainId) => `eip155:${chainId}:${accounts[0]}`),
            }
          }
        } : undefined
      },
      // Methods used in `activate` and `isomorphicInitialize`
      enable: wc2EnableMock,
      // Mock EIP-1193
      request: wc2RequestMock,
      on() {
        return this
      },
      removeListener() {
        return this
      },
    }))
  })

  afterEach(() => {
    wc2RequestMock.mockReset()
  })

  describe('#connectEagerly', () => {
    test('should fail when no existing session', async () => {
      const {connector} = createTestEnvironment({ chains })
      await expect(connector.connectEagerly()).rejects.toThrow()
    })
  })

  describe(`#isomorphicInitialize`, () => {
    test('should initialize exactly one provider and return a Promise if pending initialization', async () => {
      const {connector, store} = createTestEnvironment({ chains })
      connector.activate()
      connector.activate()
      expect(wc2InitMock).toHaveBeenCalledTimes(1)
    })
  })

  describe('#activate', () => {
    test('should take first chain as default', async () => {
      const {connector, store} = createTestEnvironment({ chains })
      await connector.activate()
      expect(store.getState()).toEqual({
        chainId: chains[0],
        accounts,
        activating: false,
        error: undefined,
      })
    })

    test('should use `defaultChainId` when available', async () => {
      const {connector, store} = createTestEnvironment({ chains }, 3)
      await connector.activate()
      expect(store.getState().chainId).toEqual(3)
    })

    test('should use chain passed as argument', async () => {
      const {connector, store} = createTestEnvironment({ chains })
      await connector.activate(2)
      expect(store.getState().chainId).toEqual(2)
    })

    test('should prefer argument over `defaultChainId`', async () => {
      const {connector, store} = createTestEnvironment({ chains }, 3)
      await connector.activate(2)
      expect(store.getState().chainId).toEqual(2)
    })
    
    test('should throw an error when activating an unknown chain', async () => {
      const {connector} = createTestEnvironment({ chains })
      expect(connector.activate(99)).rejects.toThrow('unknown')
    })

    test('should throw an error when using optional chain as default', async () => {
      const {connector} = createTestEnvironment({ chains, optionalChains: [8] })
      expect(connector.activate(8)).rejects.toThrow('invalid')
    })

    test('should switch to an optional chain', async () => {
      const {connector} = createTestEnvironment({ chains, optionalChains: [8] })
      await connector.activate()
      await connector.activate(8)
      expect(wc2RequestMock).toHaveBeenCalledWith({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x8` }]
      })
    })

    // TODO: fix the mock and uncomment
    // test('should throw an error when activating an inactive optional chain', async () => {
    //   // @ts-expect-error we're pursposefully mocking only the subset of `EthereumProvider`'s session that we use internally
    //   jest.spyOn(EthereumProvider.prototype, 'session', 'get').mockReturnValueOnce({
    //     namespaces: {
    //       eip155: {
    //         accounts: [],
    //         methods: [],
    //         events: [],
    //       },
    //     },
    //   })
    //   const {connector} = createTestEnvironment({ chains, optionalChains: [8] })
    //   await connector.activate(1)
    //   await connector.activate(8)
    // })

    test('should switch chain', async () => {
      const {connector} = createTestEnvironment({ chains })
      await connector.activate()
      await connector.activate(2)
      expect(wc2RequestMock).toHaveBeenCalledWith({ method: 'wallet_switchEthereumChain', params: [{ chainId: '0x2' }] })
    })
    
    test('should not switch chain if already connected', async () => {
      const {connector} = createTestEnvironment({ chains })
      await connector.activate(2)
      await connector.activate(2)
      expect(wc2RequestMock).toBeCalledTimes(0)
    })
  })
})
