import type WalletConnectProvider from '@walletconnect/ethereum-provider'
import type { Actions, ProviderRpcError } from '@web3-react/types'
import { Connector } from '@web3-react/types'
import EventEmitter3 from 'eventemitter3'

import {
  downloadAppButtons,
  getBestUrlMap,
  getChainsWithDefault,
  promisify,
  retry,
  walletFooterSelector,
  walletQrHelpBtnSelector,
  walletQrLogoSelector,
  walletQrSelector,
} from './utils'
import { DOWNLOAD_ID } from './const'

export const URI_AVAILABLE = 'URI_AVAILABLE'
const DEFAULT_TIMEOUT = 5000

/**
 * Options to configure the WalletConnect provider.
 * For the full list of options, see {@link https://docs.walletconnect.com/2.0/javascript/providers/ethereum#initialization WalletConnect documentation}.
 */
export type WalletConnectOptions = Omit<Parameters<typeof WalletConnectProvider.init>[0], 'rpcMap'> & {
  /**
   * Map of chainIds to rpc url(s). If multiple urls are provided, the first one that responds
   * within a given timeout will be used. Note that multiple urls are not supported by WalletConnect by default.
   * That's why we extend its options with our own `rpcMap` (@see getBestUrlMap).
   */
  rpcMap?: { [chainId: number]: string | string[] }
  /** @deprecated Use `rpcMap` instead. */
  rpc?: { [chainId: number]: string | string[] }
}

/**
 * Options to configure the WalletConnect connector.
 */
export interface WalletConnectConstructorArgs {
  actions: Actions
  /** Options to pass to `@walletconnect/ethereum-provider`. */
  options: WalletConnectOptions
  /** The chainId to connect to in activate if one is not provided. */
  defaultChainId?: number
  /**
   * @param timeout - Timeout, in milliseconds, after which to treat network calls to urls as failed when selecting
   * online urls.
   */
  timeout?: number
  /**
   * @param onError - Handler to report errors thrown from WalletConnect.
   */
  onError?: (error: Error) => void
}

function walletQrOnOpen() {
  setTimeout(async () => {
    setTimeout(() => {
      ;[...document?.querySelectorAll('w3m-modal')].slice(0, -1).forEach((node) => node.remove())
    })

    setTimeout(async () => {
      const helpBtn = await retry(promisify(walletQrHelpBtnSelector), { n: 20, waitTime: 100 }).promise
      if (helpBtn) helpBtn.outerHTML = '<div></div>'
    })

    setTimeout(async function () {
      const walletQr = await retry(promisify(walletQrSelector), { n: 20, waitTime: 100 }).promise
      if (walletQr && !walletQr.innerHTML.includes(DOWNLOAD_ID))
        walletQr.innerHTML = walletQr.innerHTML + downloadAppButtons()
    })

    setTimeout(async function () {
      const walletConnectQrLogo = await retry(promisify(walletQrLogoSelector), { n: 100, waitTime: 50 }).promise
      if (walletConnectQrLogo)
        walletConnectQrLogo.outerHTML = `
          <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 25 25">
            <g fill="none" fill-rule="evenodd">
              <path fill="#1DE9B6"
                d="M12.924 14.416c.266-.005.484.206.49.471l.15 8.201c.005.233-.157.434-.385.48l-3.304.664c-.085.017-.174.01-.256-.019-.25-.089-.38-.363-.291-.613l3.153-8.865c.067-.188.244-.316.443-.32zm1.71.394c.195-.18.5-.167.679.028l5.18 5.633c.062.067.103.15.12.238.047.261-.126.511-.386.56l-5.06.929c-.025.005-.05.007-.077.008-.265.005-.484-.206-.489-.472l-.122-6.562c-.002-.137.054-.269.155-.362zm-2.898-.994c.024.093.02.19-.012.281l-2.498 7.055c-.088.25-.363.38-.613.292-.065-.023-.125-.06-.174-.108l-5.19-5.048c-.19-.185-.194-.49-.01-.68.062-.062.139-.107.223-.13l7.688-2.006c.256-.067.519.087.586.344zm4.497-1.101l7.87 1.621c.247.051.413.285.378.536l-.839 6.1c-.036.262-.278.446-.541.41-.111-.015-.214-.07-.29-.152l-7.03-7.722c-.179-.196-.165-.5.032-.678.113-.104.27-.146.42-.115zM.596 7.465c.095-.249.372-.373.62-.278l10.796 4.128c.145.055.254.178.293.328.067.256-.088.519-.344.585L.593 15.182c-.052.014-.106.018-.16.014-.264-.021-.46-.253-.44-.517l.573-7.082c.003-.045.014-.09.03-.133zm20.838-3.653c.088.07.149.17.17.28l1.63 8.145c.053.26-.116.513-.376.565-.063.013-.128.013-.19 0l-7.002-1.437c-.26-.054-.427-.308-.374-.567.016-.075.048-.145.096-.204l5.371-6.707c.166-.207.468-.24.675-.075zm-8-1.404c.042.073.065.156.065.24v7.414c0 .265-.215.48-.48.48-.06 0-.117-.01-.172-.032L5.159 7.564c-.248-.095-.371-.373-.277-.62.04-.103.113-.188.208-.244l7.687-4.466c.23-.134.523-.056.657.174zm1.05-2.119c.088-.25.363-.38.613-.291l5.128 1.823c.05.018.098.045.14.078.207.166.24.468.074.675l-5.129 6.4c-.09.114-.228.18-.374.18-.265 0-.48-.215-.48-.48V.45c0-.055.009-.109.027-.16z"
                transform="translate(-17.000000, -15.000000) translate(17.000000, 15.000000) translate(0.060727, 0.000000)" />
            </g>
          </svg>`
    })
    setTimeout(async function () {
      const walletFooter = await retry(promisify(walletFooterSelector), { n: 100, waitTime: 50 }).promise
      if (walletFooter) walletFooter.remove()
    })
  }, 150)
}

export class WalletConnect extends Connector {
  /** {@inheritdoc Connector.provider} */
  public provider?: WalletConnectProvider
  public readonly events = new EventEmitter3()

  private readonly options: Omit<WalletConnectOptions, 'rpcMap' | 'chains'>

  private readonly rpcMap?: Record<number, string | string[]>
  private readonly chains: number[]
  private readonly defaultChainId?: number
  private readonly timeout: number

  private eagerConnection?: Promise<WalletConnectProvider>

  constructor({ actions, options, defaultChainId, timeout = DEFAULT_TIMEOUT, onError }: WalletConnectConstructorArgs) {
    super(actions, onError)

    const { rpcMap, rpc, chains, ...rest } = options

    this.options = rest
    this.chains = chains
    this.defaultChainId = defaultChainId
    this.rpcMap = rpcMap || rpc
    this.timeout = timeout
  }

  private disconnectListener = (error: ProviderRpcError) => {
    this.actions.resetState()
    if (error) this.onError?.(error)
  }

  private chainChangedListener = (chainId: string): void => {
    this.actions.update({ chainId: Number.parseInt(chainId, 16) })
  }

  private accountsChangedListener = (accounts: string[]): void => {
    this.actions.update({ accounts })
  }

  private URIListener = (uri: string): void => {
    this.events.emit(URI_AVAILABLE, uri)
  }

  private isomorphicInitialize(
    desiredChainId: number | undefined = this.defaultChainId,
  ): Promise<WalletConnectProvider> {
    if (this.eagerConnection) return this.eagerConnection

    const rpcMap = this.rpcMap ? getBestUrlMap(this.rpcMap, this.timeout) : undefined
    const chains = desiredChainId ? getChainsWithDefault(this.chains, desiredChainId) : this.chains

    return (this.eagerConnection = import('@walletconnect/ethereum-provider').then(async (ethProviderModule) => {
      const provider = (this.provider = await ethProviderModule.default.init({
        ...this.options,
        chains,
        rpcMap: await rpcMap,
      }))

      // wc2 dont have unsubcribe method, so we have to workaround ...
      let isFirstRun = true
      this.provider.modal?.subscribeModal(function (state) {
        if (state.open && isFirstRun) {
          walletQrOnOpen()
        }
        isFirstRun = false
      })

      return provider
        .on('disconnect', this.disconnectListener)
        .on('chainChanged', this.chainChangedListener)
        .on('accountsChanged', this.accountsChangedListener)
        .on('display_uri', this.URIListener)
    }))
  }

  /** {@inheritdoc Connector.connectEagerly} */
  public async connectEagerly(): Promise<void> {
    const cancelActivation = this.actions.startActivation()

    try {
      const provider = await this.isomorphicInitialize()
      // WalletConnect automatically persists and restores active sessions
      if (!provider.session) {
        throw new Error('No active session found. Connect your wallet first.')
      }
      this.actions.update({ accounts: provider.accounts, chainId: provider.chainId })
    } catch (error) {
      await this.deactivate()
      cancelActivation()
      throw error
    }
  }

  /**
   * @param desiredChainId - The desired chainId to connect to.
   */
  public async activate(desiredChainId?: number): Promise<void> {
    const provider = await this.isomorphicInitialize(desiredChainId)

    if (provider.session) {
      if (!desiredChainId || desiredChainId === provider.chainId) return
      // WalletConnect exposes connected accounts, not chains: `eip155:${chainId}:${address}`
      const isConnectedToDesiredChain = provider.session.namespaces.eip155.accounts.some((account) =>
        account.startsWith(`eip155:${desiredChainId}:`),
      )
      if (!isConnectedToDesiredChain) {
        if (this.options.optionalChains?.includes(desiredChainId)) {
          throw new Error(
            `Cannot activate an optional chain (${desiredChainId}), as the wallet is not connected to it.\n\tYou should handle this error in application code, as there is no guarantee that a wallet is connected to a chain configured in "optionalChains".`,
          )
        }
        throw new Error(
          `Unknown chain (${desiredChainId}). Make sure to include any chains you might connect to in the "chains" or "optionalChains" parameters when initializing WalletConnect.`,
        )
      }
      return provider.request<void>({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${desiredChainId.toString(16)}` }],
      })
    }

    const cancelActivation = this.actions.startActivation()

    try {
      await provider.enable()
      this.actions.update({ chainId: provider.chainId, accounts: provider.accounts })
    } catch (error) {
      await this.deactivate()
      cancelActivation()
      throw error
    }
  }

  /** {@inheritdoc Connector.deactivate} */
  public async deactivate(): Promise<void> {
    this.provider
      ?.removeListener('disconnect', this.disconnectListener)
      .removeListener('chainChanged', this.chainChangedListener)
      .removeListener('accountsChanged', this.accountsChangedListener)
      .removeListener('display_uri', this.URIListener)
      .disconnect()
    this.provider = undefined
    this.eagerConnection = undefined
    this.actions.resetState()
  }
}
