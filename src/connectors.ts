import EventEmitter from 'events'
import ProviderEngine from 'web3-provider-engine'
import RpcSubprovider from 'web3-provider-engine/subproviders/rpc'
import WalletConnectSubprovider from '@walletconnect/web3-subprovider'

import { getNewProvider, getNetworkId, getAccounts } from './libraries'

import { Library, LibraryName, ConnectorArguments } from './types'

interface ErrorCodes {
  [propName: string]: string
}

interface InjectedConnectorArguments extends ConnectorArguments {
  readonly listenForNetworkChanges?: boolean
  readonly listenForAccountChanges?: boolean
}

interface NetworkOnlyArguments extends ConnectorArguments {
  readonly providerURL: string
}

interface WalletConnectConnectorArguments extends NetworkOnlyArguments {
  readonly bridge: string
}

export function ErrorCodeMixin (Base: any, errorCodes: string[]) {
  return class extends Base {
    constructor(kwargs: ConnectorArguments = {}) {
      super(kwargs)
    }

    static get errorCodes(): ErrorCodes {
      return errorCodes.reduce(
        (accumulator: ErrorCodes, currentValue: string) => {
          accumulator[currentValue] = currentValue
          return accumulator
        }, {}
      )
    }
  }
}

const ConnectorErrorCodes = ['UNSUPPORTED_NETWORK']
export abstract class Connector extends ErrorCodeMixin(EventEmitter, ConnectorErrorCodes) {
  readonly activateAccountImmediately: boolean
  readonly supportedNetworks: ReadonlyArray<number> | undefined

  constructor(kwargs: ConnectorArguments = {}) {
    super()

    const { activateAccountImmediately, supportedNetworks } = kwargs

    this.activateAccountImmediately = activateAccountImmediately === undefined ? true : activateAccountImmediately
    this.supportedNetworks = supportedNetworks

    this.active = false
  }

  protected validateNetworkId (networkId: number) {
    if (this.supportedNetworks && !this.supportedNetworks.includes(networkId)) {
      const unsupportedNetworkError = Error(`Unsupported Network: ${networkId}.`)
      unsupportedNetworkError.code = Connector.errorCodes.UNSUPPORTED_NETWORK
      throw unsupportedNetworkError
    }

    return networkId
  }

  async onActivation (): Promise<void> {
    this.active = true
    this.emit('Activated')
  }
  onDeactivation (): void {
    this.emit('Deactivated')
    this.active = false
  }
  abstract async getLibrary (libraryName: LibraryName): Promise<Library>
  abstract async getNetworkId (library: Library): Promise<number>
  abstract async getAccount (library: Library, fromActivateAccount?: boolean): Promise<string | null>
}


const MetaMaskConnectorErrorCodes = ['ETHEREUM_ACCESS_DENIED', 'LEGACY_PROVIDER', 'NO_WEB3', 'UNLOCK_REQUIRED']
export class MetaMaskConnector extends ErrorCodeMixin(Connector, MetaMaskConnectorErrorCodes) {
  readonly listenForNetworkChanges: boolean
  readonly listenForAccountChanges: boolean
  private runOnDeactivation: Function[]

  constructor(kwargs: InjectedConnectorArguments = {}) {
    const { listenForNetworkChanges, listenForAccountChanges, ...rest } = kwargs
    super({ ...rest, activateAccountImmediately: true })

    this.listenForNetworkChanges = listenForNetworkChanges || true
    this.listenForAccountChanges = listenForAccountChanges || true

    this.runOnDeactivation = []
  }

  private networkChangedHandler (networkId: number) {
    this.emit('_web3ReactUpdateNetworkId', networkId)
  }

  private accountsChangedHandler (accounts: string[]) {
    this.emit('_web3ReactUpdateAccount', accounts[0])
  }

  async onActivation () {
    await super.onActivation()
    const { ethereum, web3 } = window

    if (ethereum) {
      await ethereum.enable()
        .catch(e => {
          const deniedAccessError: Error = Error(`Access Denied: ${e.toString()}.`)
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

  onDeactivation () {
    this.runOnDeactivation.forEach(runner => runner())
    this.runOnDeactivation = []
  }

  async getLibrary (libraryName: LibraryName): Promise<Library> {
    const { ethereum } = window
    return getNewProvider(libraryName, 'injected', ethereum)
  }

  async getNetworkId(library: Library) {
    const networkId = await getNetworkId(library)
    return this.validateNetworkId(networkId)
  }

  async getAccount(library: Library) {
    const accounts: string[] = await getAccounts(library)
    if (!accounts || !accounts[0]) {
      const unlockRequiredError: Error = Error('Ethereum account locked.')
      unlockRequiredError.code = MetaMaskConnector.errorCodes.UNLOCK_REQUIRED
      throw unlockRequiredError
    }

    return accounts[0]
  }
}

export class NetworkOnlyConnector extends Connector {
  readonly providerURL: string

  constructor(kwargs: NetworkOnlyArguments) {
    const { providerURL, ...rest } = kwargs
    super(rest)

    this.providerURL = providerURL
  }

  async getLibrary (libraryName: LibraryName): Promise<Library> {
    return getNewProvider(libraryName, 'http', this.providerURL)
  }

  async getNetworkId(library: Library): Promise<number> {
    const networkId = await getNetworkId(library)
    return this.validateNetworkId(networkId)
  }

  async getAccount(): Promise<null> {
    return null
  }
}

export class InfuraConnector extends NetworkOnlyConnector {}

const WalletConnectConnectorErrorCodes = ['WALLETCONNECT_TIMEOUT']
export class WalletConnectConnector extends ErrorCodeMixin(Connector, WalletConnectConnectorErrorCodes) {
  readonly bridge: string
  private engine: any
  private walletConnector: any

  constructor(kwargs: WalletConnectConnectorArguments) {
    const { bridge, providerURL, activateAccountImmediately, ...rest } = kwargs
    super({ ...rest, activateAccountImmediately: true }) // we need to call getAccount every time....

    this.bridge = bridge

    const engine = new ProviderEngine()

    engine.addProvider(new WalletConnectSubprovider({
      bridge: this.bridge
    }))

    engine.addProvider(new RpcSubprovider({
      rpcUrl: providerURL
    }))

    engine.start()

    this.engine = engine
    this.walletConnector = this.engine._providers[0]._walletConnector
  }

  private connectAndSessionUpdateHandler (error: Error, payload: any) {
    console.log('inside handler')
    if (error) {
      this.emit('_web3ReactError', error)
    } else {
      const { chainId, accounts } = payload.params[0]

      // validate the chainId
      try {
        this.validateNetworkId(chainId)
        this.emit('_web3ReactUpdateAccount', accounts[0])
      } catch (error) {
        this.emit('_web3ReactError', error)
      }
    }
  }

  private disconnectHandler (error: Error) {
    if (error) {
      this.emit('_web3ReactError', error)
    } else {
      this.emit('_web3ReactReset')
    }
  }

  async onActivation () {
    await super.onActivation()

    if (!this.walletConnector.connected) {
      await this.walletConnector.createSession()
    }

    this.uri = this.walletConnector.uri

    // initialize event listeners
    this.walletConnector.on('connect', this.connectAndSessionUpdateHandler)
    this.walletConnector.on('session_update', this.connectAndSessionUpdateHandler)
    this.walletConnector.on('disconnect', this.disconnectHandler)
  }

  async getLibrary (libraryName: LibraryName): Promise<Library> {
    return getNewProvider(libraryName, 'walletconnect', this.engine)
  }

  async getNetworkId(library: Library) {
    const networkId = await getNetworkId(library)
    return this.validateNetworkId(networkId)
  }

  async getAccount(library: Library, fromActivateAccount: boolean): Promise<string | null> {
    window.walletConnector = this.walletConnector

    if (!fromActivateAccount)
      return null

    if (this.walletConnectSubprovider.connected) {
      const accounts: string[] = await getAccounts(library)
      console.log(accounts)
      if (!accounts || !accounts[0]) throw Error('No accounts found.')
      return accounts[0]
    }

    return null
  }

  async onDeactivation () {
    // TODO remove listeners here once exposed in walletconnect
  }
}
