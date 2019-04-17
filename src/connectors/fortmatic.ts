let Fortmatic: any
try {
  Fortmatic = require('fortmatic')
} catch (error) {
  Fortmatic = null
}

import { Provider } from '../manager'
import Connector, { ErrorCodeMixin, ConnectorArguments } from './connector'

interface FortmaticConnectorArguments extends ConnectorArguments {
  readonly apiKey: string
  readonly testNetwork?: string
  readonly logoutOnDeactivation?: boolean
}

const FortmaticConnectorErrorCodes = ['ETHEREUM_ACCESS_DENIED']
export default class FortmaticConnector extends ErrorCodeMixin(Connector, FortmaticConnectorErrorCodes) {
  public readonly fortmatic: any
  private logoutOnDeactivation: boolean

  public constructor(kwargs: FortmaticConnectorArguments) {
    if (Fortmatic === null) {
      throw Error('Please install the Fortmatic SDK: yarn add fortmatic@^0.7')
    }

    const { apiKey, testNetwork, logoutOnDeactivation = false, ...rest } = kwargs
    super(rest)

    this.fortmatic = new Fortmatic(apiKey, testNetwork)
    this.logoutOnDeactivation = logoutOnDeactivation
  }

  public async onActivation(): Promise<void> {
    await this.fortmatic.user.login().catch(
      (error: any): void => {
        const deniedAccessError: Error = Error(`Access Denied: ${error.toString()}.`)
        deniedAccessError.code = FortmaticConnector.errorCodes.ETHEREUM_ACCESS_DENIED
        throw deniedAccessError
      }
    )
  }

  public async getProvider(): Promise<Provider> {
    return this.fortmatic.getProvider()
  }

  public async getAccount(provider: Provider): Promise<string | null> {
    return provider.account
  }

  public onDeactivation(): void {
    if (this.logoutOnDeactivation) {
      this.fortmatic.user.logout()
    }
  }
}
