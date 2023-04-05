// Not avaiable in the `node` environment, but required by WalletConnect
global.TextEncoder = jest.fn()
global.TextDecoder = jest.fn()

import { createWeb3ReactStoreAndActions } from '@web3-react/store'
import { MockEIP1193Provider } from '@web3-react/core'
import { RequestArguments } from '@web3-react/types'
import { EthereumProvider } from '@walletconnect/ethereum-provider'

import { WalletConnect, WalletConnectOptions } from '.'

const createTestEnvironment = (opts: Omit<WalletConnectOptions, 'projectId'>) => {
  const [store, actions] = createWeb3ReactStoreAndActions()
  const connector = new WalletConnect({ actions, options: { ...opts, projectId: '' } })
  return {connector, store}
}

const accounts = ['0x0000000000000000000000000000000000000000']
const chains = [1, 2, 3]

type SwitchEthereumChainRequestArguments = {
  method: 'wallet_switchEthereumChain',
  params: [{ chainId: string }]
}

const isSwitchEthereumChainRequest = (x: RequestArguments): x is SwitchEthereumChainRequestArguments => {
  return x.method === 'wallet_switchEthereumChain'
}

class MockWalletConnectProvider extends MockEIP1193Provider<number> {
  /** per {@link https://eips.ethereum.org/EIPS/eip-3326#specification EIP-3326} */
  public eth_switchEthereumChain = jest.fn((args: string) => null)

  public request(x: RequestArguments | SwitchEthereumChainRequestArguments): Promise<unknown> {
    if (isSwitchEthereumChainRequest(x)) {
      this.chainId = parseInt(x.params[0].chainId, 16)
      return Promise.resolve(this.eth_switchEthereumChain(JSON.stringify(x)))
    } else {
      return super.request(x)
    }
  }

  public enable() {
    return super.request({ method: 'eth_requestAccounts' })
  }

  // session is an object when connected, undefined otherwise
  get session() {
    return this.eth_requestAccounts.mock.calls.length > 0 ? {} : undefined
  }
}

describe('WalletConnect', () => {
  let wc2InitMock: jest.Mock

  beforeEach(() => {
    /*
     * TypeScript error is expected here. We're mocking a factory `init` method
     * to only define a subset of `EthereumProvider` that we use internally
     */
    // @ts-ignore
    wc2InitMock = jest.spyOn(EthereumProvider, 'init').mockImplementation(async (opts) => {
      const provider = new MockWalletConnectProvider()
      provider.chainId = opts.chains[0]
      provider.accounts = accounts
      return provider
    })
  })

  describe('#connectEagerly', () => {
    test('should fail when no existing session', async () => {
      const {connector} = createTestEnvironment({ chains })
      await expect(connector.connectEagerly()).rejects.toThrow()
    })
  })

  describe(`#isomorphicInitialize`, () => {
    test('should initialize exactly one provider and return a Promise if pending initialization', async () => {
      const {connector} = createTestEnvironment({ chains })
      connector.activate()
      connector.activate()
      expect(wc2InitMock).toHaveBeenCalledTimes(1)
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
      const {connector} = createTestEnvironment({ chains })
      await connector.activate(2)
      expect(connector.provider?.chainId).toEqual(2)
    })
    
    test('should throw an error for invalid chain', async () => {
      const {connector} = createTestEnvironment({ chains })
      expect(connector.activate(99)).rejects.toThrow()
    })
    
    test('should switch chain if already connected', async () => {
      const {connector} = createTestEnvironment({ chains })
      await connector.activate()
      expect(connector.provider?.chainId).toEqual(1)
      await connector.activate(2)
      expect(connector.provider?.chainId).toEqual(2)
    })
    
    test('should not switch chain if already connected', async () => {
      const {connector} = createTestEnvironment({ chains })
      await connector.activate(2)
      await connector.activate(2)
      expect((connector.provider as unknown as MockWalletConnectProvider).eth_switchEthereumChain).toBeCalledTimes(0)
    })
  })
})
