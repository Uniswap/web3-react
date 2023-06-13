import { OAuthExtension, OAuthProvider, OAuthRedirectResult } from '@magic-ext/oauth'
import { InstanceWithExtensions, SDKBase } from '@magic-sdk/provider'
import { Actions, AddEthereumChainParameter, Connector, ProviderConnectInfo, ProviderRpcError } from '@web3-react/types'
import { Magic, MagicSDKAdditionalConfiguration } from 'magic-sdk'

function parseChainId(chainId: string | number) {
  return typeof chainId === 'number' ? chainId : Number.parseInt(chainId, chainId.startsWith('0x') ? 16 : 10)
}

export interface MagicAuthSDKOptions extends MagicSDKAdditionalConfiguration {
  magicAuthApiKey: string
  redirectURI?: string
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
  public provider: any
  public magic: InstanceWithExtensions<SDKBase, OAuthExtension[]>
  public chainId: number
  magicAuthApiKey: string
  public redirectURI: string
  private readonly options: MagicAuthSDKOptions
  public authId?: string
  oAuthProvider: OAuthProvider
  public oAuthResult: OAuthRedirectResult | null

  constructor({ actions, options, onError }: MagicAuthConstructorArgs) {
    super(actions, onError)
    this.options = options
    this.magicAuthApiKey = options.magicAuthApiKey || 'pk_live_846F1095F0E1303C'
    this.oAuthProvider = options.oAuthProvider
    this.redirectURI = options.redirectURI || window.location.href
    this.oAuthResult = null
    // Initializing Magic Instance in constructor otherwise it will be undefined when calling connectEagerly
    const { magic, chainId, provider } = this.initializeMagicInstance()
    this.magic = magic
    this.chainId = chainId
    this.provider = provider
    console.log('MagicConnect constructor', this.magic, this.chainId, this.provider)
  }

  private getMagic(): InstanceWithExtensions<SDKBase, OAuthExtension[]> {
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

  private setEventListeners(): void {
    if (this.provider) {
      this.provider.on('connect', this.connectListener)
      this.provider.on('disconnect', this.disconnectListener)
      this.provider.on('chainChanged', this.chainChangedListener)
      this.provider.on('accountsChanged', this.accountsChangedListener)
    }
  }

  private removeEventListeners(): void {
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

    // Create a new Magic instance with desired ChainId for network switching
    // or with the networkOptions if no parameters were passed to the function
    const magic = this.getMagic()

    // Get the provider from magicInstance
    const provider = magic.rpcProvider

    // Set the chainId. If no chainId was passed as a parameter, use the chainId from networkOptions
    const chainId = desiredChainIdOrChainParameters?.chainId || networkOptions.chainId

    return { magic, chainId, provider }
  }

  async getAuthId() {
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

  // "autoconnect"
  public override async connectEagerly(): Promise<void> {
    const isLoggedIn = await this.checkLoggedInStatus()
    if (!isLoggedIn) return
    await this.activate()
  }

  // "connect"
  public async activate(desiredChainIdOrChainParameters?: AddEthereumChainParameter): Promise<void> {
    const cancelActivation = this.actions.startActivation()

    try {
      // Initialize the magic instance
      if (await this.isAuthorized()) {
        this.completeActivation()
      }

      const { magic, chainId: networkId, provider } = this.initializeMagicInstance(desiredChainIdOrChainParameters)
      this.magic = magic
      this.chainId = networkId
      this.provider = provider

      await this.magic.oauth.loginWithRedirect({
        provider: this.oAuthProvider,
        redirectURI: this.redirectURI,
      })

      this.setEventListeners()

      if (await magic.user.isLoggedIn()) {
        // TODO URGENT - this is not working since it needs to wait for the redirect to happen
        this.completeActivation()
      }
    } catch (error) {
      cancelActivation()
    }
  }

  // "disconnect"
  public override async deactivate(): Promise<void> {
    this.actions.resetState()
    await this.magic?.wallet.disconnect()
    this.removeEventListeners()
  }

  // sets the account and chainId for the connector completing the login
  public async completeActivation(): Promise<void> {
    // Get the current chainId and account from the provider
    const [chainId, accounts] = await Promise.all([
      this.provider?.request({ method: 'eth_chainId' }) as Promise<string>,
      this.provider?.request({ method: 'eth_accounts' }) as Promise<string[]>,
    ])

    // Update the connector state with the current chainId and account
    this.actions.update({ chainId: parseChainId(chainId), accounts })
  }

  public async isAuthorized() {
    try {
      const magic = this.getMagic()
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
