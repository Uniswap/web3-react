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

/**
 * @param options - Options to pass to `@gnosis.pm/safe-apps-sdk`.
 */
export interface GnosisSafeConstructorArgs {
  actions: Actions
  options?: Opts
}

export class GnosisSafe extends Connector {
  /** {@inheritdoc Connector.provider} */
  public provider?: SafeAppProvider

  private readonly options?: Opts
  private eagerConnection?: Promise<void>

  /**
   * A `SafeAppsSDK` instance.
   */
  public sdk: SafeAppsSDK | undefined

  constructor({ actions, options }: GnosisSafeConstructorArgs) {
    super(actions)
    this.options = options
  }

  /**
   * A function to determine whether or not this code is executing on a server.
   */
  private get serverSide() {
    return typeof window === 'undefined'
  }

  /**
   * A function to determine whether or not this code is executing in an iframe.
   */
  private get inIframe() {
    if (this.serverSide) return false
    if (window !== window.parent) return true
    return false
  }

  private async isomorphicInitialize(): Promise<void> {
    if (this.eagerConnection) return

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

    try {
      await this.isomorphicInitialize()
      if (!this.provider) throw new NoSafeContext()

      this.actions.update({
        chainId: this.provider.chainId,
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        accounts: [await this.sdk!.safe.getInfo().then(({ safeAddress }) => safeAddress)],
      })
    } catch (error) {
      cancelActivation()
      throw error
    }
  }

  public async activate(): Promise<void> {
    if (!this.inIframe) throw new NoSafeContext()

    // only show activation if this is a first-time connection
    let cancelActivation: () => void
    if (!this.sdk) cancelActivation = this.actions.startActivation()

    return this.isomorphicInitialize()
      .then(async () => {
        if (!this.provider) throw new NoSafeContext()

        this.actions.update({
          chainId: this.provider.chainId,
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          accounts: [await this.sdk!.safe.getInfo().then(({ safeAddress }) => safeAddress)],
        })
      })
      .catch((error) => {
        cancelActivation?.()
        throw error
      })
  }
}
