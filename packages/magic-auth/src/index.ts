import { OAuthExtension, OAuthProvider, OAuthRedirectResult } from '@magic-ext/oauth'
import { InstanceWithExtensions, SDKBase } from '@magic-sdk/provider'
import { Actions, AddEthereumChainParameter, Connector, ProviderConnectInfo, ProviderRpcError } from '@web3-react/types'
import { Magic, MagicSDKAdditionalConfiguration } from 'magic-sdk'

function parseChainId(chainId: string | number) {
  return typeof chainId === 'number' ? chainId : Number.parseInt(chainId, chainId.startsWith('0x') ? 16 : 10)
}

export interface MagicAuthSDKOptions extends MagicSDKAdditionalConfiguration {
  magicAuthApiKey: string
  redirectURI: string
  oAuthProvider: OAuthProvider
  networkOptions: {
    rpcUrl: string
    chainId: number
  }
}

export interface MagicAuthConstructorArgs {
  actions: Actions
  options: MagicAuthSDKOptions
  onError?: (error: Error) => void
}

export class MagicConnect extends Connector {
  name: string
  authId?: string
  provider: any
  magic: InstanceWithExtensions<SDKBase, OAuthExtension[]> | null
  chainId: number
  magicAuthApiKey: string
  redirectURI: string
  oAuthProvider: OAuthProvider
  oAuthResult: OAuthRedirectResult | null
  private readonly options: MagicAuthSDKOptions


  constructor({ actions, options, onError }: MagicAuthConstructorArgs) {
    super(actions, onError)
    this.options = options
    this.name = `${options.oAuthProvider as string} Connector`
    this.magicAuthApiKey = options.magicAuthApiKey || 'pk_live_846F1095F0E1303C'
    this.oAuthProvider = options.oAuthProvider
    this.redirectURI = options.redirectURI
    if (!this.serverSide && window.location.href) this.redirectURI = window.location.href
    this.oAuthResult = null
    const { magic, chainId, provider } = this.initializeMagicInstance()
    this.magic = magic
    this.chainId = chainId
    this.provider = provider
  }

  private getMagic(): InstanceWithExtensions<SDKBase, OAuthExtension[]> | null {
    if (this.magic) return this.magic
    const { magicAuthApiKey, networkOptions } = this.options

    // Create a new Magic instance with desired ChainId for network switching
    // or with the networkOptions if no parameters were passed to the function
    return new Magic(magicAuthApiKey, {
      network: {
        chainId: networkOptions.chainId,
        rpcUrl: networkOptions.rpcUrl,
      },
      extensions: [new OAuthExtension()],
    })
  }

  private connectListener = ({ chainId }: ProviderConnectInfo): void => {
    this.actions.update({ chainId: parseChainId(chainId) })
  }

  private disconnectListener = (error?: ProviderRpcError): void => {
    this.actions.resetState()
    if (error) this.onError?.(error)
  }

  private chainChangedListener = (chainId: number | string): void => {
    this.actions.update({ chainId: parseChainId(chainId) })
  }

  private accountsChangedListener = (accounts: string[]): void => {
    if (accounts.length === 0) {
      this.actions.resetState()
    } else {
      this.actions.update({ accounts })
    }
  }

  setEventListeners(): void {
    if (this.provider) {
      this.provider.on('connect', this.connectListener)
      this.provider.on('disconnect', this.disconnectListener)
      this.provider.on('chainChanged', this.chainChangedListener)
      this.provider.on('accountsChanged', this.accountsChangedListener)
    }
  }

  removeEventListeners(): void {
    if (this.provider) {
      this.provider.off('connect', this.connectListener)
      this.provider.off('disconnect', this.disconnectListener)
      this.provider.off('chainChanged', this.chainChangedListener)
      this.provider.off('accountsChanged', this.accountsChangedListener)
    }
  }

  private initializeMagicInstance(desiredChainIdOrChainParameters?: AddEthereumChainParameter) {
    // Extract apiKey and networkOptions from options
    const { networkOptions } = this.options
    if (this.serverSide) return { magic: null, chainId: networkOptions.chainId, provider: null }

    // Create a new Magic instance with desired ChainId for network switching
    // or with the networkOptions if no parameters were passed to the function
    const magic = this.getMagic()

    // Get the provider from magicInstance
    const provider = magic?.rpcProvider

    // Set the chainId. If no chainId was passed as a parameter, use the chainId from networkOptions
    const chainId = desiredChainIdOrChainParameters?.chainId || networkOptions.chainId
    this.isAuthorized().then((isAuthorized) => {
      if (isAuthorized) this.completeActivation()
    })
    return { magic, chainId, provider }
  }

  getAuthId() {
    if (this.authId) {
      return this.authId
    }
    if (!this.oAuthResult) {
      return 'null'
    }
    const authId = this.oAuthResult.oauth.userInfo.preferredUsername
      ? this.oAuthResult.oauth.userInfo.preferredUsername
      : this.oAuthResult.oauth.userInfo.email
    this.authId = `${this.oAuthResult.oauth.provider}###${authId}`
    return this.authId
  }

  private async checkLoggedInStatus() {
    try {
      const isLoggedIn = await this.magic?.user.isLoggedIn()
      return isLoggedIn
    } catch (error) {
      return false
    }
  }

  /**
   * A function to determine whether or not this code is executing on a server.
   */
  private get serverSide() {
    return typeof window === 'undefined'
  }

  // "autoconnect"
  override async connectEagerly(): Promise<void> {
    const isLoggedIn = await this.checkLoggedInStatus()
    if (!isLoggedIn) return
    await this.activate()
  }

  // "connect"
  async activate(desiredChainIdOrChainParameters?: AddEthereumChainParameter): Promise<void> {
    const cancelActivation = this.actions.startActivation()
    try {
      // Initialize the magic instance
      if (await this.isAuthorized()) {
        this.completeActivation()
        return
      }

      // if it failed to be initialized during construction due to server side rendering, initialize it now
      if (this.magic == null || this.provider == null) {
        const { magic, chainId: networkId, provider } = this.initializeMagicInstance(desiredChainIdOrChainParameters)
        this.magic = magic
        this.chainId = networkId
        this.provider = provider
      }

      await this.magic?.oauth.loginWithRedirect({
        provider: this.oAuthProvider,
        redirectURI: this.redirectURI,
      })

      this.setEventListeners()

      if (await this.magic?.user.isLoggedIn()) {
        // TODO URGENT - this is not working since it needs to wait for the redirect to happen
        this.completeActivation()
      }
    } catch (error) {
      cancelActivation()
    }
  }

  // "disconnect"
  override async deactivate(): Promise<void> {
    this.actions.resetState()
    await this.magic?.wallet.disconnect()
    this.removeEventListeners()
  }

  // sets the account and chainId for the connector completing the login
  async completeActivation(): Promise<void> {
    // Get the current chainId and account from the provider
    const [chainId, accounts] = await Promise.all([
      this.provider?.request({ method: 'eth_chainId' }) as Promise<string>,
      this.provider?.request({ method: 'eth_accounts' }) as Promise<string[]>,
    ])

    // Update the connector state with the current chainId and account
    this.actions.update({ chainId: parseChainId(chainId), accounts })
    this.authId = this.getAuthId()
  }

  async isAuthorized() {
    try {
      const magic = this.getMagic()
      if (magic == null) return false

      const isLoggedIn = await magic.user.isLoggedIn()
      if (isLoggedIn) {
        return true
      }

      if (this.oAuthResult) {
        return true
      }
      this.oAuthResult = await magic.oauth.getRedirectResult()
      return this.oAuthResult != null
    } catch {
      return false
    }
  }
}
