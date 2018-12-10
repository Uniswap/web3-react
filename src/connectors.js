import Web3 from 'web3'
import WalletConnect from 'walletconnect'

export class Connector {
  constructor({ pollForNetworkChanges, networkPollInterval, pollForAccountChanges, accountPollInterval }) {
    if (!(typeof pollForNetworkChanges === 'boolean'))
      throw Error(`Passed 'pollForNetworkChanges' parameter ${pollForNetworkChanges} is not a boolean.`)
    if (pollForNetworkChanges && !Number.isInteger(networkPollInterval))
      throw Error(`Passed 'networkPollInterval' parameter ${networkPollInterval} is not an integer.`)

    if (!(typeof pollForAccountChanges === 'boolean'))
      throw Error(`Passed 'pollForAccountChanges' parameter ${pollForAccountChanges} is not a boolean.`)
    if (pollForAccountChanges && !Number.isInteger(accountPollInterval))
      throw Error(`Passed 'accountPollInterval' parameter ${accountPollInterval} is not an integer.`)

    this.pollForNetworkChanges = pollForNetworkChanges
    this.pollForAccountChanges = pollForAccountChanges

    this.networkPollInterval = pollForNetworkChanges ? networkPollInterval : null
    this.accountPollInterval = pollForAccountChanges ? accountPollInterval : null
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
  if (!(errorCodes.length >= 1))
    throw Error(`Required parameter 'errorCodes' does not have length >= 1.`)
  if (!errorCodes.every(e => typeof e === 'string'))
    throw Error(`Required parameter 'errorCodes' contains a non-string element.`)

  return class extends Base {
    static get errorCodes() {
      return { errorCodes }.reduce(
        (accumulator, currentValue) => {
          accumulator[currentValue] = currentValue
          return accumulator
        },
        {}
      )
    }
  }
}

export class InjectedConnector extends ErrorCodeMixin(Connector, ['ETHEREUM_ACCESS_DENIED', 'NO_WEB3']) {
  constructor({ supportedNetworks = [1, 3, 4, 42], networkPollInterval = 2000, accountPollInterval = 500 } = {}) {
    if (!Array.isArray(supportedNetworks))
      throw Error(`Optional parameter 'supportedNetworks' is not an array.`)
    if (!(supportedNetworks.length >= 1))
      throw Error(`Optional parameter 'errorCodes' does not have length >= 1.`)
    if (supportedNetworks.every(n => !Number.isInteger(n)))
      throw Error(`Optional parameter 'supportedNetworks' contains a non-integer element.`)

    super({
      pollForNetworkChanges: true, networkPollInterval: networkPollInterval,
      pollForAccountChanges: true, accountPollInterval: accountPollInterval
    })
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
    else if (web3 && web3.currentProvider) {
      return new Web3(web3.currentProvider)
    }
    // no injected web3 detected
    else {
      const noWeb3Error = Error('No injected web3 provider detected.')
      noWeb3Error.code = InjectedConnector.errorCodes.NO_WEB3
      throw noWeb3Error
    }
  }

  async getNetworkId(library) {
    return library.eth.net.getId()
  }

  async getAccount(library) {
    return library.eth.getAccounts()
      .then(accounts => (!accounts || !accounts[0]) ? null : accounts[0])
  }
}

export class WalletConnectConnector extends Connector {
  constructor({ providerURL, bridgeURL, dappName } = {}) {
    super({ pollForNetworkChanges: false, pollForAccountChanges: false })

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
    return library.eth.net.getId()
  }

  async getAccount() {
    if (this.webConnector.isConnected) {
      const accounts = this.webConnector.accounts
      return (!accounts || !accounts[0]) ? null : accounts[0]
    } else {
      await this.webConnector.initSession()
      this.uri = this.webConnector.uri
      await this.webConnector.listenSessionStatus()
      const accounts = this.webConnector.accounts
      return (!accounts || !accounts[0]) ? null : accounts[0]
    }
  }
}

export class NetworkOnlyConnector extends Connector {
  constructor({ providerURL } = {}) {
    super({ pollForNetworkChanges: false, pollForAccountChanges: false })

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
    return library.eth.net.getId()
  }

  async getAccount() {
    return null
  }
}
