import type { Actions, Provider, ProviderConnectInfo, ProviderRpcError } from '@web3-react/types'
import { Connector } from '@web3-react/types'

declare global {
  interface Window {
    tally?: TallyHoProvider
  }
}

export interface TallyHoProvider extends Provider {
  isTally: boolean
}
export interface ConnectEagerlyConfig {
  retries: number
  timeoutMs: number
}

function isTally(provider: unknown): provider is TallyHoProvider {
  return (
    typeof provider === 'object' &&
    provider !== null &&
    'request' in provider &&
    'isTally' in provider &&
    (provider as TallyHoProvider).isTally === true
  )
}

function isConnectEagerlyConfig(arg: unknown): arg is ConnectEagerlyConfig {
  return (
    typeof arg === 'object' &&
    typeof (arg as ConnectEagerlyConfig).retries === 'number' &&
    typeof (arg as ConnectEagerlyConfig).timeoutMs === 'number'
  )
}

function parseChainId(chainId: string) {
  return Number.parseInt(chainId, 16)
}

export class TallyHo extends Connector {
  /** {@inheritdoc Connector.provider} */
  provider: Provider | undefined

  /**
   * This parameter is used to make sure only one initialization is in progress at a time.
   * E.g.: When `connectEagerly` constructor parameter set to true and the `tallyHo.connectEagerly()`
   * method is used in an useEffect then it results in 2 requests.
   */
  isActivationInProgress = false

  /**
   * @param connectEagerly - A flag indicating whether connection should be initiated when the class is constructed.
   */
  constructor(actions: Actions, connectEagerly?: boolean | ConnectEagerlyConfig) {
    super(actions)

    if (connectEagerly) {
      if (connectEagerly === true) {
        void this.connectEagerly()
      } else if (isConnectEagerlyConfig(connectEagerly)) {
        void this.connectEagerly(connectEagerly)
      } else {
        throw new Error(
          `connectEagerly is expected to be 'true' OR {retries: number, timeoutMs: number}, but ${JSON.stringify(
            connectEagerly
          )} was received instead.`
        )
      }
    }
  }

  /** {@inheritdoc Connector.connectEagerly} */
  public async connectEagerly(config: ConnectEagerlyConfig = { retries: 5, timeoutMs: 500 }): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      let counter = 0

      /**
       * When `connectEagerly` is set to true at class initialization time there is no window present.
       * But it is usually ready in 1-2 seconds, so we shall wait for it.
       */
      function waitForWindow() {
        if (typeof window === 'undefined') {
          counter++

          if (counter === config.retries) {
            reject(
              `window was not present after ${config.retries} retries (with ${config.timeoutMs}ms wait period). Try using the connectEagerly method in a useEffect`
            )
          }

          setTimeout(waitForWindow, config.timeoutMs)
        } else {
          resolve()
        }
      }

      waitForWindow()
    }).then(() => this.activate())
  }

  /** {@inheritdoc Connector.activate} */
  public async activate(): Promise<void> {
    if (window === undefined) {
      throw new Error(
        "window is not defined. This should not have happened. 'Toto, I have a feeling we're not in Kansas anymore! 🌪'"
      )
    }

    if (!this.provider) {
      this.initializeProvider()
    }

    if (this.isActivationInProgress) return

    this.isActivationInProgress = true

    if (isTally(this.provider)) {
      const cancelActivation = this.actions.startActivation()

      return this.provider
        .request({ method: 'eth_requestAccounts' })
        .then((accounts) =>
          Promise.all([
            this.provider?.request({ method: 'eth_chainId' }) as Promise<string>,
            accounts as string[],
          ]).then(([chainId, accounts]) => {
            this.actions.update({ chainId: parseChainId(chainId), accounts })
          })
        )
        .catch((error: Error) => {
          this.actions.reportError(error)
          cancelActivation()
        })
        .finally(() => {
          this.isActivationInProgress = false
        })
    }
  }

  private initializeProvider() {
    if (!isTally(window.tally)) {
      throw new Error("You don't seem to have TallyHo installed because window.tally is not a TallyHo provider.")
    }
    this.provider = window.tally

    this.provider.on('connect', ({ chainId }: ProviderConnectInfo): void => {
      this.actions.update({ chainId: parseChainId(chainId) })
    })

    this.provider.on('disconnect', (error: ProviderRpcError): void => {
      this.actions.reportError(error)
    })

    this.provider.on('chainChanged', (chainId: string): void => {
      this.actions.update({ chainId: parseChainId(chainId) })
    })

    this.provider.on('accountsChanged', (accounts: string[]): void => {
      this.actions.update({ accounts })
    })
  }
}
