import { Provider } from '../types'
import Connector, { ErrorCodeMixin, IConnectorArguments } from './connector'

const InjectedConnectorErrorCodes = ['ETHEREUM_ACCESS_DENIED', 'LEGACY_PROVIDER', 'NO_WEB3', 'UNLOCK_REQUIRED']
export default class InjectedConnector extends ErrorCodeMixin(Connector, InjectedConnectorErrorCodes) {
  private runOnDeactivation: Array<() => void> = []

  constructor(kwargs: IConnectorArguments) {
    super(kwargs)

    this.networkChangedHandler = this.networkChangedHandler.bind(this)
    this.accountsChangedHandler = this.accountsChangedHandler.bind(this)
  }

  public async onActivation(): Promise<void> {
    const { ethereum, web3 } = window

    if (ethereum) {
      await ethereum.enable().catch((error: any) => {
        const deniedAccessError: Error = Error(error)
        deniedAccessError.code = InjectedConnector.errorCodes.ETHEREUM_ACCESS_DENIED
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

      if (ethereum.isMetaMask) {
        ethereum.autoRefreshOnNetworkChange = false
      }
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

  public async getProvider(): Promise<Provider> {
    const { ethereum } = window
    return ethereum
  }

  public async getAccount(provider: Provider): Promise<string> {
    const account = super.getAccount(provider)

    if (account === null) {
      const unlockRequiredError: Error = Error('Ethereum account locked.')
      unlockRequiredError.code = InjectedConnector.errorCodes.UNLOCK_REQUIRED
      throw unlockRequiredError
    }

    return account
  }

  public onDeactivation(): void {
    this.runOnDeactivation.forEach(runner => runner())
    this.runOnDeactivation = []
  }

  // event handlers
  private networkChangedHandler(networkId: string | number): void {
    super._web3ReactUpdateNetworkIdHandler(Number(networkId))
  }

  private accountsChangedHandler(accounts: string[]): void {
    super._web3ReactUpdateAccountHandler(accounts[0])
  }
}
