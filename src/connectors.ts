// tslint:disable: max-classes-per-file
import WalletConnectSubprovider from '@walletconnect/web3-subprovider'
import EventEmitter from 'events'
import ProviderEngine from 'web3-provider-engine'
import RpcSubprovider from 'web3-provider-engine/subproviders/rpc' // tslint:disable-line: no-submodule-imports

import { getAccounts, getNetworkId, getNewLibraryFromProvider, getNewLibraryFromURL } from './libraries'

import { Library, LibraryName } from './types'

interface IErrorCodes {
  [propName: string]: string
}

export interface IConnectorArguments {
  readonly supportedNetworks?: ReadonlyArray<number>
}

interface INetworkOnlyArguments extends IConnectorArguments {
  readonly providerURL: string
}

interface ISupportedNetworkURLs {
  [propName: string]: string
}

interface IWalletConnectConnectorArguments extends INetworkOnlyArguments {
  readonly bridge: string
  readonly supportedNetworkURLs: ISupportedNetworkURLs
  readonly defaultNetwork: number
}

export function ErrorCodeMixin(Base: any, errorCodes: string[]) {
  return class extends Base {
    constructor(kwargs: IConnectorArguments = {}) {
      super(kwargs)
    }

    static get errorCodes(): IErrorCodes {
      return errorCodes.reduce((accumulator: IErrorCodes, currentValue: string) => {
        accumulator[currentValue] = currentValue
        return accumulator
      }, {})
    }
  }
}

const ConnectorErrorCodes = ['UNSUPPORTED_NETWORK']
export abstract class Connector extends ErrorCodeMixin(EventEmitter, ConnectorErrorCodes) {
  private readonly supportedNetworks: ReadonlyArray<number> | undefined

  constructor(kwargs: IConnectorArguments = {}) {
    super()

    const { supportedNetworks } = kwargs
    this.supportedNetworks = supportedNetworks
    this.active = false
  }

  public async onActivation(): Promise<void> {
    this.active = true
    this.emit('Activated')
  }

  public onDeactivation(): void {
    this.emit('Deactivated')
    this.active = false
  }

  public abstract async getLibrary(libraryName: LibraryName, networkId?: number): Promise<Library>
  public abstract async getNetworkId(library: Library): Promise<number>
  public abstract async getAccount(library: Library): Promise<string | null>

  protected validateNetworkId(networkId: number) {
    if (this.supportedNetworks && !this.supportedNetworks.includes(networkId)) {
      const unsupportedNetworkError = Error(`Unsupported Network: ${networkId}.`)
      unsupportedNetworkError.code = Connector.errorCodes.UNSUPPORTED_NETWORK
      throw unsupportedNetworkError
    }

    return networkId
  }

  // wraps emissions of _web3ReactUpdateNetworkId
  protected _web3ReactUpdateNetworkIdHandler(networkId: number) {
    this.emit('_web3ReactUpdateNetworkId', networkId)
  }

  // wraps emissions of _web3ReactUpdateAccount
  protected _web3ReactUpdateAccountHandler(account: string) {
    this.emit('_web3ReactUpdateAccount', account)
  }

  // wraps emissions of _web3ReactUpdateNetworkIdAndAccount
  protected _web3ReactUpdateNetworkIdAndAccountHandler(networkId: number, account: string) {
    this.emit('_web3ReactUpdateNetworkIdAndAccount', networkId, account)
  }

  // wraps emissions of _web3ReactError
  protected _web3ReactErrorHandler(error: Error) {
    this.emit('_web3ReactError', error)
  }

  // wraps emissions of _web3ReactError
  protected _web3ReactResetHandler() {
    this.emit('_web3ReactReset')
  }
}

const MetaMaskConnectorErrorCodes = ['ETHEREUM_ACCESS_DENIED', 'LEGACY_PROVIDER', 'NO_WEB3', 'UNLOCK_REQUIRED']
export class MetaMaskConnector extends ErrorCodeMixin(Connector, MetaMaskConnectorErrorCodes) {
  private runOnDeactivation: Array<() => void> = []

  constructor(kwargs: IConnectorArguments = {}) {
    super(kwargs)

    this.networkChangedHandler = this.networkChangedHandler.bind(this)
    this.accountsChangedHandler = this.accountsChangedHandler.bind(this)
  }

  public async onActivation() {
    await super.onActivation()
    const { ethereum, web3 } = window

    if (ethereum) {
      await ethereum.enable().catch(error => {
        const deniedAccessError: Error = Error(`Access Denied: ${error.toString()}.`)
        deniedAccessError.code = MetaMaskConnector.errorCodes.ETHEREUM_ACCESS_DENIED
        throw deniedAccessError
      })

      // initialize event listeners
      if (ethereum.on && ethereum.removeListener) {
        ethereum.on('networkChanged', this.networkChangedHandler)
        ethereum.on('accountsChanged', this.accountsChangedHandler)

        this.runOnDeactivation.push(() => {
          ethereum.removeListener('networkChanged', this.networkChangedHandler)
          ethereum.removeListener('accountsChanged', this.accountsChangedHandler)
        })
      } else {
        // tslint:disable-next-line: no-console
        console.error("The injected 'ethereum' object does not support the appropriate listener methods.")
      }
    } else if (web3) {
      const legacyError: Error = Error('Your web3 provider is outdated, please upgrade to a modern provider.')
      legacyError.code = MetaMaskConnector.errorCodes.LEGACY_PROVIDER
      throw legacyError
    } else {
      const noWeb3Error: Error = Error('Your browser is not equipped with web3 capabilities.')
      noWeb3Error.code = MetaMaskConnector.errorCodes.NO_WEB3
      throw noWeb3Error
    }
  }

  public async getLibrary(libraryName: LibraryName): Promise<Library> {
    const { ethereum } = window
    return getNewLibraryFromProvider(libraryName, ethereum)
  }

  public async getNetworkId(library: Library) {
    const networkId = await getNetworkId(library)
    return this.validateNetworkId(networkId)
  }

  public async getAccount(library: Library) {
    const accounts: string[] = await getAccounts(library)
    if (!accounts || !accounts[0]) {
      const unlockRequiredError: Error = Error('Ethereum account locked.')
      unlockRequiredError.code = MetaMaskConnector.errorCodes.UNLOCK_REQUIRED
      throw unlockRequiredError
    }

    return accounts[0]
  }

  public onDeactivation() {
    this.runOnDeactivation.forEach(runner => runner())
    this.runOnDeactivation = []
  }

  // metamask event handlers
  private networkChangedHandler(networkId: number) {
    this._web3ReactUpdateNetworkIdHandler(networkId)
  }

  private accountsChangedHandler(accounts: string[]) {
    this._web3ReactUpdateAccountHandler(accounts[0])
  }
}

export class NetworkOnlyConnector extends Connector {
  private readonly providerURL: string

  constructor(kwargs: INetworkOnlyArguments) {
    const { providerURL, ...rest } = kwargs
    super(rest)

    this.providerURL = providerURL
  }

  public async getLibrary(libraryName: LibraryName): Promise<Library> {
    return getNewLibraryFromURL(libraryName, this.providerURL)
  }

  public async getNetworkId(library: Library): Promise<number> {
    const networkId = await getNetworkId(library)
    return this.validateNetworkId(networkId)
  }

  public async getAccount(): Promise<null> {
    return null
  }
}

export class WalletConnectConnector extends Connector {
  private bridge: any
  private supportedNetworkURLs: ISupportedNetworkURLs
  private defaultNetwork: number
  private walletConnectSubprovider: any
  private walletConnector: any

  constructor(kwargs: IWalletConnectConnectorArguments) {
    const { bridge, supportedNetworkURLs, defaultNetwork } = kwargs
    const supportedNetworks = Object.keys(supportedNetworkURLs).map(supportedNetworkURL => Number(supportedNetworkURL))
    super({ supportedNetworks })

    this.bridge = bridge
    this.supportedNetworkURLs = supportedNetworkURLs
    this.defaultNetwork = defaultNetwork

    this.connectAndSessionUpdateHandler = this.connectAndSessionUpdateHandler.bind(this)
    this.disconnectHandler = this.disconnectHandler.bind(this)
  }

  public async onActivation() {
    await super.onActivation()

    const walletConnectSubprovider = new WalletConnectSubprovider({ bridge: this.bridge })

    this.walletConnectSubprovider = walletConnectSubprovider
    this.walletConnector = this.walletConnectSubprovider._walletConnector

    if (!this.walletConnector.connected) {
      await this.walletConnector.createSession()
    }

    this.uri = this.walletConnector.uri

    // initialize event listeners
    this.walletConnector.on('connect', this.connectAndSessionUpdateHandler)
    this.walletConnector.on('session_update', this.connectAndSessionUpdateHandler)
    this.walletConnector.on('disconnect', this.disconnectHandler)
  }

  public async getLibrary(libraryName: LibraryName, networkId?: number): Promise<Library> {
    // this should never happened, because it probably means there was a funky walletconnect race condition
    if (networkId && this.walletConnector.chainId && networkId !== this.walletConnector.chainId) {
      throw Error('Unexpected Error. Please file an issue on Github.')
    }

    // we have to validate here because networkId might not be a key of supportedNetworkURLs
    const networkIdToUse = this.walletConnector.chainId || networkId || this.defaultNetwork

    if (networkIdToUse) {
      try {
        this.validateNetworkId(networkIdToUse)
      } catch (error) {
        throw error
      }
    }

    const engine = new ProviderEngine()
    engine.addProvider(this.walletConnectSubprovider)
    engine.addProvider(new RpcSubprovider({ rpcUrl: this.supportedNetworkURLs[networkIdToUse] }))
    engine.start()

    return getNewLibraryFromProvider(libraryName, engine)
  }

  public async getNetworkId(library: Library) {
    const networkId = await getNetworkId(library)
    return this.validateNetworkId(networkId)
  }

  public async getAccount(library: Library): Promise<string | null> {
    if (this.walletConnector.connected) {
      const accounts: string[] = await getAccounts(library)
      if (!accounts || !accounts[0]) {
        throw Error('No accounts found.')
      }
      return accounts[0]
    } else {
      return null
    }
  }

  public async onDeactivation() {
    // TODO remove listeners here once exposed in walletconnect
  }

  // walletconnect event handlers
  private connectAndSessionUpdateHandler(error: Error, payload: any) {
    if (error) {
      this._web3ReactErrorHandler(error)
    } else {
      const { chainId, accounts } = payload.params[0]
      this._web3ReactUpdateNetworkIdAndAccountHandler(chainId, accounts[0])
    }
  }

  private disconnectHandler(error: Error) {
    if (error) {
      this._web3ReactErrorHandler(error)
    } else {
      this._web3ReactResetHandler()
    }
  }
}
