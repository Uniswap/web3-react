import { MagicConnect, MagicAuthSDKOptions } from './index'
import { Actions } from '@web3-react/types'

describe('MagicConnect', () => {
  const mockActions: Actions & { cancelActivation: () => void} = {
    update: jest.fn(),
    resetState: jest.fn(),
    startActivation: jest.fn().mockReturnValue(() => jest.fn()),
    cancelActivation: jest.fn(),
  }

  const mockOptions: MagicAuthSDKOptions = {
    magicAuthApiKey: 'test-api-key',
    redirectURI: 'http://localhost/',
    oAuthProvider: 'google',
    networkOptions: {
      rpcUrl: 'http://localhost:8545',
      chainId: 1337,
    },
  }

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('constructor', () => {
    it('should initialize Magic instance and set properties', () => {
      const magicConnect = new MagicConnect({ actions: mockActions, options: mockOptions })

      expect(magicConnect.magic).toBeDefined()
      expect(magicConnect.chainId).toBe(mockOptions.networkOptions.chainId)
      expect(magicConnect.provider).toBeDefined()
      expect(magicConnect.magicAuthApiKey).toBe(mockOptions.magicAuthApiKey)
      expect(magicConnect.oAuthProvider).toBe(mockOptions.oAuthProvider)
      expect(magicConnect.redirectURI).toBe(mockOptions.redirectURI)
      expect(magicConnect.oAuthResult).toBeNull()
    })
  })

  describe('connectEagerly', () => {
    it('should activate if user is logged in', async () => {
      const magicConnect = new MagicConnect({ actions: mockActions, options: mockOptions })
      const mockIsLoggedIn = jest.fn().mockResolvedValue(true)
      magicConnect.magic = { user: { isLoggedIn: mockIsLoggedIn } } as any
      magicConnect.completeActivation = jest.fn()
      await magicConnect.connectEagerly()

      expect(mockActions.startActivation).toHaveBeenCalled()
      expect(mockActions.resetState).not.toHaveBeenCalled()
      expect(magicConnect.completeActivation).toHaveBeenCalled()
    })

  })

  describe('activate', () => {
    it('should activate Magic instance and set event listeners', async () => {
      const magicConnect = new MagicConnect({ actions: mockActions, options: mockOptions })
      const mockLoginWithRedirect = jest.fn().mockResolvedValue(undefined)
      magicConnect.magic = { oauth: { loginWithRedirect: mockLoginWithRedirect }, user: { isLoggedIn: jest.fn().mockResolvedValue(false) } } as any

      mockActions.startActivation = jest.fn()
      magicConnect.setEventListeners = jest.fn()

      await magicConnect.activate()

      expect(mockActions.startActivation).toHaveBeenCalled()
      expect(mockLoginWithRedirect).toHaveBeenCalledWith({ provider: mockOptions.oAuthProvider, redirectURI: mockOptions.redirectURI })
      expect(magicConnect.setEventListeners).toHaveBeenCalled()
    })

    it('should complete activation if user is already logged in', async () => {
      const magicConnect = new MagicConnect({ actions: mockActions, options: mockOptions })
      const mockIsLoggedIn = jest.fn().mockResolvedValue(true)
      magicConnect.magic = { user: { isLoggedIn: mockIsLoggedIn } } as any

      mockActions.startActivation = jest.fn()
      mockActions.resetState = jest.fn();
      magicConnect.completeActivation = jest.fn();
      
      await magicConnect.activate()

      expect(mockActions.startActivation).toHaveBeenCalled()
      expect(mockActions.resetState).not.toHaveBeenCalled()
      expect(magicConnect.completeActivation).toHaveBeenCalled()
    })

  })

  describe('deactivate', () => {
    it('should reset state and disconnect wallet', async () => {
      const magicConnect = new MagicConnect({ actions: mockActions, options: mockOptions })
      const mockDisconnect = jest.fn().mockResolvedValue(undefined)
      magicConnect.magic = { wallet: { disconnect: mockDisconnect } } as any
      magicConnect.removeEventListeners = jest.fn();
      mockActions.resetState = jest.fn();
      await magicConnect.deactivate()

      expect(mockActions.resetState).toHaveBeenCalled()
      expect(mockDisconnect).toHaveBeenCalled()
      expect(magicConnect.removeEventListeners).toHaveBeenCalled()
    })
  })

  describe('completeActivation', () => {
    it('should update connector state with chainId and accounts', async () => {
      const magicConnect = new MagicConnect({ actions: mockActions, options: mockOptions })
      const mockChainId = '0x1'
      const mockAccounts = ['0x123', '0x456']
      const mockRequest = jest.fn().mockResolvedValueOnce(mockChainId).mockResolvedValueOnce(mockAccounts)
      magicConnect.provider = { request: mockRequest } as any

      await magicConnect.completeActivation()

      expect(mockActions.update).toHaveBeenCalledWith({ chainId: 1, accounts: mockAccounts })
    })
  })

  describe('isAuthorized', () => {
    it('should return true if user is logged in', async () => {
      const magicConnect = new MagicConnect({ actions: mockActions, options: mockOptions })
      const mockIsLoggedIn = jest.fn().mockResolvedValue(true)
      magicConnect.magic = { user: { isLoggedIn: mockIsLoggedIn } } as any

      const result = await magicConnect.isAuthorized()

      expect(result).toBe(true)
    })


    it('should return false if user is not logged in and OAuth redirect result is not present', async () => {
      const magicConnect = new MagicConnect({ actions: mockActions, options: mockOptions })
      const mockIsLoggedIn = jest.fn().mockResolvedValue(false)
      magicConnect.magic = { user: { isLoggedIn: mockIsLoggedIn }, oauth: { getRedirectResult: jest.fn().mockResolvedValue(null) } } as any

      const result = await magicConnect.isAuthorized()

      expect(result).toBe(false)
    })

    it('should return false if an error occurs', async () => {
      const magicConnect = new MagicConnect({ actions: mockActions, options: mockOptions })
      const mockIsLoggedIn = jest.fn().mockRejectedValue(new Error('Test error'))
      magicConnect.magic = { user: { isLoggedIn: mockIsLoggedIn } } as any

      const result = await magicConnect.isAuthorized()

      expect(result).toBe(false)
    })
  })
})