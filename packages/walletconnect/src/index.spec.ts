// Not avaiable in the `node` environment, but required by WalletConnect
global.TextEncoder = jest.fn()
global.TextDecoder = jest.fn()

// We are not using Web3Modal and it is not available in the `node` environment either
jest.mock('@web3modal/standalone', () => ({ Web3Modal: jest.fn().mockImplementation() }))

import { createWeb3ReactStoreAndActions } from '@web3-react/store'
import { EthereumProvider } from '@walletconnect/ethereum-provider'

import { WalletConnect } from '.'

const createTestEnvironment = (chains: number[]) => {
  const [store, actions] = createWeb3ReactStoreAndActions()
  const connector = new WalletConnect({ actions, options: { projectId: 'a6cc11517a10f6f12953fd67b1eb67e7', chains } })
  return {connector, store}
}

describe('WalletConnect', () => {
  describe('#connectEagerly', () => {
    test('should fail when no existing session', async () => {
      const {connector} = createTestEnvironment([1])
      await expect(connector.connectEagerly()).rejects.toThrow()
    })
  })
  describe('#activate', () => {
    test('should activate', async () => {
      const chainId = 1
      const accounts = ['0x0000000000000000000000000000000000000000']

      const {connector, store} = createTestEnvironment([chainId])

      // @ts-ignore
      jest.spyOn(EthereumProvider, 'init').mockResolvedValueOnce({
        accounts,
        chainId,
        on() {},
        async enable() { return accounts },
      })

      await connector.activate()

      expect(store.getState()).toEqual({
        chainId,
        accounts,
        activating: false,
        error: undefined,
      })
    })
  })
})
