import { Provider } from '../manager'
import Connector, { ErrorCodeMixin, ConnectorArguments } from './connector'

interface InjectedConnectorArguments extends ConnectorArguments {
  readonly requireAccount?: boolean
}

const InjectedConnectorErrorCodes = ['ETHEREUM_ACCESS_DENIED', 'LEGACY_PROVIDER', 'NO_WEB3', 'UNLOCK_REQUIRED']
export default class InjectedConnector extends ErrorCodeMixin(Connector, InjectedConnectorErrorCodes) {
  private runOnDeactivation: (() => void)[] = []
  private readonly requireAccount: boolean

  public constructor({ requireAccount = true, ...rest }: InjectedConnectorArguments = {}) {
    super(rest)
    this.requireAccount = requireAccount

    this.networkChangedHandler = this.networkChangedHandler.bind(this)
    this.accountsChangedHandler = this.accountsChangedHandler.bind(this)
  }

  public async onActivation(): Promise<void> {
    const { ethereum, web3 } = window

    if (ethereum) {
      await ethereum.enable().catch(
        (error: any): any => {
          const deniedAccessError: Error = Error(error)
          deniedAccessError.code = InjectedConnector.errorCodes.ETHEREUM_ACCESS_DENIED
          throw deniedAccessError
        }
      )

      // initialize event listeners
      if (ethereum.on) {
        ethereum.on('networkChanged', this.networkChangedHandler)
        ethereum.on('accountsChanged', this.accountsChangedHandler)

        this.runOnDeactivation.push(
          (): void => {
            if (ethereum.removeListener) {
              ethereum.removeListener('networkChanged', this.networkChangedHandler)
              ethereum.removeListener('accountsChanged', this.accountsChangedHandler)
            }
          }
        )
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

    if (this.requireAccount && account === null) {
      const unlockRequiredError: Error = Error('Ethereum account locked.')
      unlockRequiredError.code = InjectedConnector.errorCodes.UNLOCK_REQUIRED
      throw unlockRequiredError
    }

    return account
  }

  public onDeactivation(): void {
    this.runOnDeactivation.forEach((runner): void => runner())
    this.runOnDeactivation = []
  }

  // event handlers
  private networkChangedHandler(networkId: string | number): void {
    super._web3ReactUpdateHandler({
      updateNetworkId: true,
      networkId: Number(networkId)
    })
  }

  private accountsChangedHandler(accounts: string[]): void {
    if (this.requireAccount && !accounts[0]) {
      const unlockRequiredError: Error = Error('Ethereum account locked.')
      unlockRequiredError.code = InjectedConnector.errorCodes.UNLOCK_REQUIRED
      super._web3ReactErrorHandler(unlockRequiredError, true)
    } else {
      super._web3ReactUpdateHandler({
        updateAccount: true,
        account: accounts[0]
      })
    }
  }
}
