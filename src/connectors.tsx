import EventEmitter from 'events'
import WalletConnect from 'walletconnect'

import { getNewProvider, getNetworkId, getAccounts } from './libraries'

import { Library, LibraryName } from './types'

interface ErrorCodes {
  [propName: string]: string
}

interface ConnectorArguments {
  readonly activateAccountAutomatically?: boolean
  readonly supportedNetworks?: ReadonlyArray<number>
  readonly automaticPriority?: number
}

interface InjectedConnectorArguments extends ConnectorArguments {
  readonly listenForNetworkChanges?: boolean
  readonly listenForAccountChanges?: boolean
}

interface NetworkOnlyArguments extends ConnectorArguments {
  readonly providerURL: string
}

interface RedirectConnectorArguments extends ConnectorArguments {
  readonly redirectTo: string
}

interface TrustWalletConnectorArguments extends ConnectorArguments {
  readonly dAppLink: string
}

interface WalletConnectConnectorArguments extends NetworkOnlyArguments {
  readonly bridgeURL: string
  readonly dappName: string
}

export function ErrorCodeMixin (Base: any, errorCodes: string[]) {
  if (!Array.isArray(errorCodes) || errorCodes.length < 1)
    throw Error(`Require 'errorCodes' parameter ${errorCodes} is not an array with length >= 1.`)
  if (!errorCodes.every(e => typeof e === 'string'))
    throw Error(`Required 'errorCodes' parameter${errorCodes} contains a non-string element.`)

  return class extends Base {
    constructor(kwargs?: ConnectorArguments) {
      if (kwargs) super(kwargs)
      else super()
    }

    static get errorCodes(): ErrorCodes {
      return errorCodes.reduce(
        (accumulator: any, currentValue: string) => {
          accumulator[currentValue] = currentValue
          return accumulator
        },
        {}
      )
    }
  }
}

const ConnectorErrorCodes = ['UNSUPPORTED_NETWORK']
export abstract class Connector extends ErrorCodeMixin(EventEmitter, ConnectorErrorCodes) {
  readonly activateAccountAutomatically: boolean
  readonly supportedNetworks: ReadonlyArray<number> | undefined
  readonly automaticPriority: number | undefined

  constructor(kwargs: ConnectorArguments) {
    super()

    const { activateAccountAutomatically, supportedNetworks, automaticPriority } = kwargs

    this.activateAccountAutomatically = activateAccountAutomatically || true
    this.supportedNetworks = supportedNetworks
    this.automaticPriority = automaticPriority
  }

  protected validateNetworkId (networkId: number) {
    if (this.supportedNetworks && !this.supportedNetworks.includes(networkId)) {
      const unsupportedNetworkError = Error(`Unsupported Network: ${networkId}.`)
      unsupportedNetworkError.code = Connector.errorCodes.UNSUPPORTED_NETWORK
      throw unsupportedNetworkError
    }

    return networkId
  }

  async onActivation (): Promise<void> { this.emit('Activated') }
  onDeactivation (): void { this.emit('Deactivated') }
  abstract async getLibrary (libraryName: LibraryName): Promise<Library>
  abstract async getNetworkId (library: Library): Promise<number>
  async getAccount (_: Library): Promise<string | null> { return null }
}

const InjectedConnectorErrorCodes = ['ETHEREUM_ACCESS_DENIED', 'LEGACY_PROVIDER', 'NO_WEB3', 'UNLOCK_REQUIRED']
export class InjectedConnector extends ErrorCodeMixin(Connector, InjectedConnectorErrorCodes) {
  readonly listenForNetworkChanges: boolean
  readonly listenForAccountChanges: boolean

  constructor(kwargs: InjectedConnectorArguments) {
    const { listenForNetworkChanges, listenForAccountChanges, ...rest } = kwargs
    super(rest)

    this.listenForNetworkChanges = listenForNetworkChanges || true
    this.listenForAccountChanges = listenForAccountChanges || true
  }

  async onActivation () {
    await super.onActivation()
    const { ethereum, web3 } = window

    // for modern dapp browsers
    if (ethereum) {
      await ethereum.enable()
        .catch(e => {
          const deniedAccessError = Error(`Access Denied: ${e.toString()}.`)
          deniedAccessError.code = InjectedConnector.errorCodes.ETHEREUM_ACCESS_DENIED
          throw deniedAccessError
        })
    }
    // for legacy dapp browsers
    else if (web3) {
      const legacyError: Error = Error('Your web3 provider is outdated, please upgrade to a modern provider.')
      legacyError.code = InjectedConnector.errorCodes.LEGACY_PROVIDER
      throw legacyError
    }
    // no injected web3 detected
    else {
      const noWeb3Error: Error = Error('Your browser is not equipped with web3 capabilities.')
      noWeb3Error.code = InjectedConnector.errorCodes.NO_WEB3
      throw noWeb3Error
    }
  }

  async getLibrary (libraryName: LibraryName): Promise<Library> {
    const { ethereum: provider } = window
    return getNewProvider(libraryName, 'injected', provider)
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
    const { providerURL } = this
    return getNewProvider(libraryName, 'http', providerURL)
  }

  async getNetworkId(library: Library): Promise<number> {
    const networkId = await getNetworkId(library)
    return this.validateNetworkId(networkId)
  }

  async getAccount(): Promise<null> {
    return null
  }
}

export class RedirectConnector extends Connector {
  readonly redirectTo: string

  constructor(kwargs: RedirectConnectorArguments) {
    const { redirectTo, ...rest } = kwargs
    super(rest)

    this.redirectTo = redirectTo
  }

  async getLibrary (_: LibraryName): Promise<Library> {
    throw Error('`getLibrary` calls should not be made on Connectors of type RedirectConnector.')
  }
  async getNetworkId (_: Library): Promise<number> {
    throw Error('`getNetworkId` calls should not be made on Connectors of type RedirectConnector.')
  }
}

export class MetaMaskConnector extends InjectedConnector {}

export class InfuraConnector extends NetworkOnlyConnector {}

export class WalletConnectConnector extends NetworkOnlyConnector {
  readonly bridgeURL: string
  readonly dappName: string
  webConnector: any

  constructor(kwargs: WalletConnectConnectorArguments) {
    const { bridgeURL, dappName, ...rest } = kwargs
    super(rest)

    this.bridgeURL = bridgeURL
    this.dappName = dappName
    this.webConnector = new WalletConnect({ bridgeUrl: this.bridgeURL, dappName: this.dappName })
  }

  async getAccount() {
    if (this.webConnector.isConnected) {
      const accounts = this.webConnector.accounts
      return accounts[0]
    } else {
      if (!this.webConnectorSession) this.webConnectorSession = this.webConnector.initSession()
      await this.webConnectorSession

      console.log('emitting URI')
      this.emit('URIAvailable', this.webConnector.uri)

      return this.webConnector.listenSessionStatus()
        .then(() => {
          const accounts = this.webConnector.accounts
          return accounts[0]
        })
        .catch((error: Error) => {
          if (error.message.match(/Listener\sTimeout/i)) return null
          throw error
        })
    }
  }
}

export class TrustWalletRedirectConnector extends RedirectConnector {
  constructor(kwargs: TrustWalletConnectorArguments) {
    const { dAppLink, ...rest } = kwargs
    const redirectTo: string = (
      `https://links.trustwalletapp.com/a/key_live_lfvIpVeI9TFWxPCqwU8rZnogFqhnzs4D?&event=openURL&url=${dAppLink}`
    )
    super({ redirectTo, ...rest })
  }
}
