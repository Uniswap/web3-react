import EventEmitter from 'events'
import WalletConnect from 'walletconnect'

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
  readonly bridgeURL: string
  readonly dappName: string
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
  readonly activateAccountAutomatically: boolean
  readonly supportedNetworks: ReadonlyArray<number> | undefined
  readonly automaticPriority: number | undefined

  constructor(kwargs: ConnectorArguments = {}) {
    super()

    const { activateAccountAutomatically, supportedNetworks, automaticPriority } = kwargs

    this.activateAccountAutomatically = activateAccountAutomatically || true
    this.supportedNetworks = supportedNetworks
    this.automaticPriority = automaticPriority

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
  abstract async getAccount (library: Library): Promise<string | null>
}

// begin general implementations
const InjectedConnectorErrorCodes = ['ETHEREUM_ACCESS_DENIED', 'LEGACY_PROVIDER', 'NO_WEB3', 'UNLOCK_REQUIRED']
export class InjectedConnector extends ErrorCodeMixin(Connector, InjectedConnectorErrorCodes) {
  readonly listenForNetworkChanges: boolean
  readonly listenForAccountChanges: boolean

  constructor(kwargs: InjectedConnectorArguments = {}) {
    const { listenForNetworkChanges, listenForAccountChanges, ...rest } = kwargs
    super({ ...rest, activateAccountAutomatically: true })

    this.listenForNetworkChanges = listenForNetworkChanges || true
    this.listenForAccountChanges = listenForAccountChanges || true
  }

  async onActivation () {
    await super.onActivation()
    const { ethereum, web3 } = window

    if (ethereum) {
      await ethereum.enable()
        .catch(e => {
          const deniedAccessError: Error = Error(`Access Denied: ${e.toString()}.`)
          deniedAccessError.code = InjectedConnector.errorCodes.ETHEREUM_ACCESS_DENIED
          throw deniedAccessError
        })
    } else if (web3) {
      const legacyError: Error = Error('Your web3 provider is outdated, please upgrade to a modern provider.')
      legacyError.code = InjectedConnector.errorCodes.LEGACY_PROVIDER
      throw legacyError
    } else {
      const noWeb3Error: Error = Error('Your browser is not equipped with web3 capabilities.')
      noWeb3Error.code = InjectedConnector.errorCodes.NO_WEB3
      throw noWeb3Error
    }
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
      unlockRequiredError.code = InjectedConnector.errorCodes.UNLOCK_REQUIRED
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

// begin specific implementations
export class MetaMaskConnector extends InjectedConnector {}

export class InfuraConnector extends NetworkOnlyConnector {}

const WalletConnectConnectorErrorCodes = ['WALLETCONNECT_TIMEOUT']
export class WalletConnectConnector extends ErrorCodeMixin(NetworkOnlyConnector, WalletConnectConnectorErrorCodes) {
  readonly bridgeURL: string
  readonly dappName: string
  webConnector: any

  constructor(kwargs: WalletConnectConnectorArguments) {
    if (kwargs.automaticPriority && kwargs.activateAccountAutomatically)
      throw Error('Not Implemented: WalletConnectConnector does not support automatic account initialization.')

    const { bridgeURL, dappName, ...rest } = kwargs
    super(rest)

    this.bridgeURL = bridgeURL
    this.dappName = dappName
    this.webConnector = new WalletConnect({ bridgeUrl: this.bridgeURL, dappName: this.dappName })
  }

  async getAccount() {
    if (this.webConnector.isConnected)
      return this.webConnector.accounts[0]
    else {
      if (!this.webConnectorSession) this.webConnectorSession = this.webConnector.initSession()
      await this.webConnectorSession

      this.emit('URIAvailable', this.webConnector.uri)

      return this.webConnector.listenSessionStatus()
        .then(() => this.webConnector.accounts[0])
        .catch((error: Error) => {
          if (error.message.match(/Listener\sTimeout/i))
            error.code = WalletConnectConnector.errorCodes.WALLETCONNECT_TIMEOUT
          throw error
        })
    }
  }
}
