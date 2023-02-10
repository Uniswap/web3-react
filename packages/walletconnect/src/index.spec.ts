// Not avaiable in the `node` environment, but required by WalletConnect
global.TextEncoder = jest.fn()
global.TextDecoder = jest.fn()

// We are not using Web3Modal and it is not available in the `node` environment either
jest.mock('@web3modal/standalone', () => ({ Web3Modal: jest.fn().mockImplementation() }))

import { createWeb3ReactStoreAndActions } from '@web3-react/store'
import { EthereumProvider } from '@walletconnect/ethereum-provider'

import { WalletConnect, WalletConnectOptions } from '.'

const createTestEnvironment = (opts: Omit<WalletConnectOptions, 'projectId'>) => {
  const [store, actions] = createWeb3ReactStoreAndActions()
  const connector = new WalletConnect({ actions, options: { ...opts, projectId: '' } })
  return {connector, store }
}

const accounts = ['0x0000000000000000000000000000000000000000']
const chains = [1, 2, 3]

describe('WalletConnect', () => {
  const wc2RequestMock = jest.fn()

  beforeAll(() => {
    const wc2EnableMock = jest.fn().mockResolvedValue(accounts)

    // @ts-ignore
    // TypeScript error is expected here. We're mocking a factory `init` method
    // to only define a subset of `EthereumProvider` that we use internally
    jest.spyOn(EthereumProvider, 'init').mockImplementation(async (opts) => ({
      // we read this in `enable` to get current chain 
      accounts,
      chainId: opts.chains[0],
      // non-null `session` indicates we have a connected wallet 
      session: wc2EnableMock.mock.calls.length,
      // methods used in `activate` and `isomorphicInitialize`
      enable: wc2EnableMock,
      request: wc2RequestMock,
      // basic EventEmmiter
      on() {},
      off() {},
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

  describe('#activate', () => {
    test('should activate default chain', async () => {
      const {connector, store} = createTestEnvironment({ chains })
      await connector.activate()
      expect(store.getState()).toEqual({
        chainId: chains[0],
        accounts,
        activating: false,
        error: undefined,
      })
    })

    test('should activate passed chain', async () => {
      const {connector, store} = createTestEnvironment({ chains })
      await connector.activate(2)
      expect(store.getState().chainId).toEqual(2)
    })
    
    test('should throw an error for invalid chain', async () => {
      const {connector} = createTestEnvironment({ chains })
      expect(connector.activate(99)).rejects.toThrow()
    })
    
    test('should switch chain if already connected', async () => {
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
