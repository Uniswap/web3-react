import Web3 from 'web3'
import WalletConnect from 'walletconnect'
import EventEmitter from 'events'

export const UNSUPPORTED_NETWORK = 'UNSUPPORTED_NETWORK'
const ConnectorErrorCodes = [UNSUPPORTED_NETWORK]

export class Connector extends EventEmitter {
  constructor({ supportedNetworks = null, automaticPriority = null }) {
    super()

    if (supportedNetworks && !Array.isArray(supportedNetworks))
      throw Error(`Passed 'supportedNetworks' parameter is not an array.`)
    if (supportedNetworks && !(supportedNetworks.length >= 1))
      throw Error(`Passed 'supportedNetworks' parameter does not have length >= 1.`)
    if (supportedNetworks && supportedNetworks.every(n => !Number.isInteger(n)))
      throw Error(`Passed 'supportedNetworks' parameter contains a non-integer element.`)

    if (automaticPriority && !Number.isInteger(automaticPriority))
      throw Error(`Passed 'automaticPriority' parameter ${automaticPriority} is not an integer.`)

    this.supportedNetworks = supportedNetworks
    this.automaticPriority = automaticPriority
  }

  validateNetworkId (networkId) {
    if (this.supportedNetworks && !this.supportedNetworks.includes(networkId)) {
      const unsupportedNetworkError = Error('Unsupported Network.')
      unsupportedNetworkError.code = UNSUPPORTED_NETWORK
      throw unsupportedNetworkError
    }

    return networkId
  }

  async getLibrary () { throw Error(`Connector did not implement 'getLibrary'.`) }
  async getNetworkId () { throw Error(`Connector did not implement 'getNetworkId'.`) }
  async getAccount () { throw Error(`Connector did not implement 'getAccount'.`) }
  static get errorCodes() { return {} }
}

function ErrorCodeMixin (Base, errorCodes) {
  if (!errorCodes)
    throw Error(`Required parameter 'errorCodes' was not provided.`)
  if (!Array.isArray(errorCodes))
    throw Error(`Required parameter 'errorCodes' is not an array.`)
  if (!errorCodes.every(e => typeof e === 'string'))
    throw Error(`Required parameter 'errorCodes' contains a non-string element.`)

  return class extends Base {
    static get errorCodes() {
      return ConnectorErrorCodes.concat(errorCodes).reduce(
        (accumulator, currentValue) => {
          accumulator[currentValue] = currentValue
          return accumulator
        },
        {}
      )
    }
  }
}

const InjectedConnectorErrorCodes = ConnectorErrorCodes.concat(['ETHEREUM_ACCESS_DENIED', 'NO_WEB3', 'LEGACY_PROVIDER'])
export class InjectedConnector extends ErrorCodeMixin(Connector, InjectedConnectorErrorCodes) {
  constructor({ supportedNetworks = [1, 3, 4, 42], automaticPriority } = {}) {
    super({ supportedNetworks, automaticPriority })

    this.listenForNetworkChanges = true
    this.listenForAccountChanges = true
  }

  async getLibrary () {
    const { web3, ethereum } = window

    // for modern dapp browsers
    if (ethereum) {
      await ethereum.enable()
        .catch(e => {
          const deniedAccessError = Error(`Access Denied: ${e.toString()}.`)
          deniedAccessError.code = InjectedConnector.errorCodes.ETHEREUM_ACCESS_DENIED
          throw deniedAccessError
        })
      return new Web3(ethereum)
    }
    // for legacy dapp browsers
    else if (web3) {
      const legacyError = Error('Your web3 provider is outdated, please upgrade.')
      legacyError.code = InjectedConnector.errorCodes.LEGACY_PROVIDER
      throw legacyError
    }
    // no injected web3 detected
    else {
      const noWeb3Error = Error('No injected web3 provider detected.')
      noWeb3Error.code = InjectedConnector.errorCodes.NO_WEB3
      throw noWeb3Error
    }
  }

  async getNetworkId(library) {
    const networkId = await library.eth.net.getId()
    return super.validateNetworkId(networkId)
  }

  async getAccount(library) {
    return library.eth.getAccounts()
      .then(accounts => (!accounts || !accounts[0]) ? null : accounts[0])
  }
}

export class WalletConnectConnector extends ErrorCodeMixin(Connector, []) {
  constructor({ supportedNetworks, automaticPriority, providerURL, bridgeURL, dappName } = {}) {
    super({ supportedNetworks, automaticPriority })

    if (!providerURL)
      throw Error(`Required parameter 'providerURL' was not provided.`)
    if (typeof providerURL !== 'string')
      throw Error(`Passed 'providerURL' parameter ${providerURL} is not a string.`)
    if (!bridgeURL)
      throw Error(`Required parameter 'bridgeURL' was not provided.`)
    if (typeof bridgeURL !== 'string')
      throw Error(`Passed 'bridgeURL' parameter ${bridgeURL} is not a string.`)
    if (!dappName)
      throw Error(`Required parameter 'dappName' was not provided.`)
    if (typeof dappName !== 'string')
      throw Error(`Passed 'dappName' parameter ${dappName} is not a string.`)

    this.providerURL = providerURL
    this.bridgeURL = bridgeURL
    this.dappName = dappName
    this.webConnector = new WalletConnect({ bridgeUrl: this.bridgeURL, dappName: this.dappName })
  }

  async getLibrary () {
    return new Web3(this.providerURL)
  }

  async getNetworkId(library) {
    const networkId = await library.eth.net.getId()
    return super.validateNetworkId(networkId)
  }

  async getAccount() {
    if (this.webConnector.isConnected) {
      const accounts = this.webConnector.accounts
      return (!accounts || !accounts[0]) ? null : accounts[0]
    } else {
      if (!this.webConnectorSession)
        this.webConnectorSession = this.webConnector.initSession()
      await this.webConnectorSession
      this.uri = this.webConnector.uri
      this.emit('URIAvailable')
      await this.webConnector.listenSessionStatus()
      const accounts = this.webConnector.accounts
      return (!accounts || !accounts[0]) ? null : accounts[0]
    }
  }
}

export class NetworkOnlyConnector extends ErrorCodeMixin(Connector, []) {
  constructor({ supportedNetworks, automaticPriority, providerURL } = {}) {
    super({ supportedNetworks, automaticPriority })

    if (!providerURL)
      throw Error(`Required parameter 'providerURL' was not provided.`)
    if (typeof providerURL !== 'string')
      throw Error(`Passed 'providerURL' parameter ${providerURL} is not a string.`)

    this.providerURL = providerURL
  }

  async getLibrary () {
    return new Web3(this.providerURL)
  }

  async getNetworkId(library) {
    const networkId = await library.eth.net.getId()
    return super.validateNetworkId(networkId)
  }

  async getAccount() {
    return null
  }
}
