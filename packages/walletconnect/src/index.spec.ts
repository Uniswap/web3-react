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
  const connector = new WalletConnect({ actions, options: { ...opts, projectId: 'a6cc11517a10f6f12953fd67b1eb67e7' } })
  return {connector, store}
}

const accounts = ['0x0000000000000000000000000000000000000000']
const chains = [1]

describe('WalletConnect', () => {
  describe('#connectEagerly', () => {
    test('should fail when no existing session', async () => {
      const {connector} = createTestEnvironment({ chains })
      await expect(connector.connectEagerly()).rejects.toThrow()
    })
  })
  describe('#activate', () => {
    test('should activate', async () => {
      const {connector, store} = createTestEnvironment({ chains })

      // @ts-ignore
      jest.spyOn(EthereumProvider, 'init').mockResolvedValueOnce({
        accounts,
        chainId: chains[0],
        on() {},
        async enable() { return accounts },
      })

      await connector.activate()

      expect(store.getState()).toEqual({
        chainId: chains[0],
        accounts,
        activating: false,
        error: undefined,
      })
    })
  })
})
