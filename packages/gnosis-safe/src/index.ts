import type { SafeAppProvider } from '@gnosis.pm/safe-apps-provider'
import type SafeAppsSDK from '@gnosis.pm/safe-apps-sdk'
import type { Opts } from '@gnosis.pm/safe-apps-sdk'
import type { Actions } from '@web3-react/types'
import { Connector } from '@web3-react/types'

export class NoSafeContext extends Error {
  public constructor() {
    super('The app is loaded outside safe context')
    this.name = NoSafeContext.name
    Object.setPrototypeOf(this, NoSafeContext.prototype)
  }
}

export class GnosisSafe extends Connector {
  /** {@inheritdoc Connector.provider} */
  public provider: SafeAppProvider | undefined

  private readonly options?: Opts
  private eagerConnection?: Promise<void>

  /**
   * A `SafeAppsSDK` instance.
   */
  public sdk: SafeAppsSDK | undefined

  /**
   * @param connectEagerly - A flag indicating whether connection should be initiated when the class is constructed.
   */
  constructor(actions: Actions, connectEagerly = false, options?: Opts) {
    super(actions)

    if (connectEagerly && this.serverSide) {
      throw new Error('connectEagerly = true is invalid for SSR, instead use the connectEagerly method in a useEffect')
    }

    this.options = options

    if (connectEagerly) void this.connectEagerly()
  }

  // check if we're in an iframe
  private get inIframe() {
    if (this.serverSide) return false
    if (window !== window.parent) return true
    return false
  }

  private async isomorphicInitialize(): Promise<void> {
    if (this.eagerConnection) return this.eagerConnection

    // kick off import early to minimize waterfalls
    const SafeAppProviderPromise = import('@gnosis.pm/safe-apps-provider').then(
      ({ SafeAppProvider }) => SafeAppProvider
    )

    await (this.eagerConnection = import('@gnosis.pm/safe-apps-sdk').then(async (m) => {
      this.sdk = new m.default(this.options)

      const safe = await Promise.race([
        this.sdk.safe.getInfo(),
        new Promise<undefined>((resolve) => setTimeout(resolve, 500)),
      ])

      if (safe) {
        const SafeAppProvider = await SafeAppProviderPromise
        this.provider = new SafeAppProvider(safe, this.sdk)
      }
    }))
  }

  /** {@inheritdoc Connector.connectEagerly} */
  public async connectEagerly(): Promise<void> {
    if (!this.inIframe) return

    const cancelActivation = this.actions.startActivation()

    await this.isomorphicInitialize()
    if (!this.provider) return cancelActivation()

    try {
      this.actions.update({
        chainId: this.provider.chainId,
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        accounts: [await this.sdk!.safe.getInfo().then(({ safeAddress }) => safeAddress)],
      })
    } catch (error) {
      console.debug('Could not connect eagerly', error)
      cancelActivation()
    }
  }

  public async activate(): Promise<void> {
    if (!this.inIframe) return this.actions.reportError(new NoSafeContext())

    // only show activation if this is a first-time connection
    if (!this.sdk) this.actions.startActivation()

    await this.isomorphicInitialize()
    if (!this.provider) return this.actions.reportError(new NoSafeContext())

    try {
      this.actions.update({
        chainId: this.provider.chainId,
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        accounts: [await this.sdk!.safe.getInfo().then(({ safeAddress }) => safeAddress)],
      })
    } catch (error) {
      this.actions.reportError(error as Error | undefined)
    }
  }
}
