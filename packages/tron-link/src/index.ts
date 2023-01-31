import type {
  ConnectorArgs,
  Provider,
  ProviderRpcError,
  WatchAssetParameters,
  RequestArguments,
  Web3ReactState,
} from '@web3-react/types'
import { BigNumber } from '@ethersproject/bignumber'
import { Connector } from '@web3-react/types'

declare global {
  interface Window {
    tronLink?: TronLink
    tronWeb?: TronProvider
  }
}

export interface TronProvider extends Provider {
  isAddress(address: string): boolean
  address: {
    fromHex(address: string): string
    toHex(address: string): string
    fromPrivateKey(pk: string): string
  }
  defaultAddress: {
    hex: false | string
    base58: false | string
  }
  fromSun: (value: BigNumber) => Promise<BigNumber>
  toHex(string: string): string
  isTronLink: boolean
  fullNode: { host: string }
  request(args: RequestArguments): Promise<unknown>
  trx: {
    sign: (hex: string) => Promise<void>
    getBalance: (address: string) => Promise<BigNumber>
    getCurrentBlock: () => Promise<{ block_header: { raw_data: { number: number } } }>
  }
  getBalance: (address: string) => Promise<BigNumber>
  getBlockNumber: () => Promise<number>
}

export interface TronLink {
  ready?: boolean
  tronLinkParams?: {
    websiteName?: string
    websiteIcon?: string
  }
}

export type TronLinkOptions = {
  websiteName?: string
  websiteIcon?: string
}

export class NoTronProviderError extends Error {
  public constructor() {
    super('Tron Link not installed')
    this.name = NoTronProviderError.name
    Object.setPrototypeOf(this, NoTronProviderError.prototype)
  }
}

export const tronChainId = 728126428 // 0x2b6653dc
export const shastaChainId = 2494104990 // 0x94a9059e
export const nileChainId = 3448148188 // 0xcd8690dc

/**
 * @param options - Options to pass to the "provider" provider.
 * @param onError - Handler to report errors thrown from eventListeners.
 */
export interface TronConstructorArgs extends ConnectorArgs {
  options?: TronLinkOptions
}

export class TronLink extends Connector {
  /** {@inheritdoc Connector.provider} */
  public readonly provider: undefined
  /** {@inheritdoc Connector.customProvider} */
  public customProvider?: TronProvider
  private tronLink?: TronLink

  private readonly options?: TronLinkOptions

  constructor({ actions, options, onError, connectorOptions }: TronConstructorArgs) {
    super(actions, onError, connectorOptions)
    this.options = options
  }

  public getChainId() {
    if (!this.customProvider) return undefined

    if (this.customProvider.fullNode.host.includes('api.trongrid')) {
      return tronChainId
    } else if (this.customProvider.fullNode.host.includes('api.tronstack')) {
      return tronChainId
    } else if (this.customProvider.fullNode.host.includes('api.shasta')) {
      return shastaChainId
    } else if (this.customProvider.fullNode.host.includes('api.nile')) {
      return nileChainId
    }
  }

  public convertAddressTo0x(address: string) {
    if (address.startsWith('0x')) {
      return address
    } else if (address.startsWith('41')) {
      return '0x' + address.substring(2)
    } else if (this.customProvider) {
      // Base58 to 0x
      return '0x' + this.customProvider.address.toHex(address).substring(2)
    }
    return address
  }

  public convertAddressTo41(address: string) {
    if (address.startsWith('41')) {
      return address
    } else if (address.startsWith('0x')) {
      return '41' + address.substring(2)
    } else if (this.customProvider) {
      // Base58 to 41
      return this.customProvider.address.toHex(address)
    }

    return address
  }

  /**
   * Setup the provider and listen to its events.
   */
  private isomorphicInitialize() {
    if (this.customProvider) return

    // Check if tron link is installed
    const tronLink = window?.tronLink
    if (!tronLink) return

    // Set options
    this.tronLink = tronLink
    this.tronLink.tronLinkParams = { websiteName: this.options?.websiteName, websiteIcon: this.options?.websiteIcon }

    if (!tronLink.ready) return

    const provider = window.tronWeb

    if (!provider) return

    this.customProvider = provider

    const callbacks = (event: {
      data: {
        message: {
          action: string
          data: {
            address: string // Base58
            name: string
            node: { chain: string; chainId: string }
            data: { address: string; name: string; chainId: string; node: { chain: string; chainId: string } }
          }
        }
        isTronLink: boolean
      }
    }) => {
      if (!event.data?.isTronLink || !event.data?.message) return

      const { data, action } = event.data.message || {}

      if (action === 'tunnel') return

      // Called on login, logout, connect, disconnect, change account, change chainId
      if (action === 'tabReply') {
        const address = data?.address // Base58
        const chainId = data?.data?.node?.chainId

        if (!chainId || !address) return

        this.actions.update({
          chainId: this.parseChainId(chainId),
          accounts: [this.convertAddressTo0x(address)],
          accountIndex: 0,
        })
      }

      // Called on login, logout, change account, change chainId
      if (action === 'setAccount') {
        if (data?.address) {
          this.actions.update({
            accounts: [this.convertAddressTo0x(data.address)],
            accountIndex: 0,
          })
        } else {
          this.actions.resetState()
        }
      }

      // Called on login, change chainId
      if (action === 'setNode') {
        if (!data?.node?.chainId) return
        this.actions.update({ chainId: this.parseChainId(data.node.chainId) })
      }
    }

    window.addEventListener('message', callbacks)
  }

  /** {@inheritdoc Connector.connectEagerly} */
  public async connectEagerly(): Promise<Web3ReactState> {
    const cancelActivation = this.actions.startActivation()

    this.isomorphicInitialize()

    if (!this.customProvider) return cancelActivation()

    try {
      const { code } = (await this.customProvider.request({
        method: 'tron_requestAccounts',
      })) as {
        code: number
        message: string
      }

      if (code === 4001) throw new Error('No accounts found')

      // Grab the address
      const address = this.customProvider?.defaultAddress?.hex
        ? this.convertAddressTo0x(this.customProvider?.defaultAddress?.hex)
        : undefined

      if (!address) throw new Error('No accounts found')

      return this.actions.update({
        chainId: this.getChainId(),
        accounts: [address],
        accountIndex: address ? 0 : undefined,
      })
    } catch (error) {
      console.debug('connectEagerly Could not connect eagerly', error)
      return cancelActivation?.()
    }
  }

  /**
   * Initiates a connection.
   */
  public async activate(): Promise<void> {
    const cancelActivation = this.tronLink?.ready ? null : this.actions.startActivation()

    this.isomorphicInitialize()

    if (!this.tronLink) throw new NoTronProviderError()

    if (!this.customProvider) {
      cancelActivation?.()
      throw new Error('Unlock Wallet')
    }

    const requestAccounts = this.customProvider.request({ method: 'tron_requestAccounts' }) as Promise<{
      code: number
      message: string
    }>

    return await requestAccounts
      .then(({ code }: { code: number; message: string }) => {
        if (code === 4001) throw new Error('No accounts returned')

        const address = this.customProvider?.defaultAddress?.hex
          ? this.convertAddressTo0x(this.customProvider?.defaultAddress?.hex)
          : undefined

        if (!address) throw new Error('No accounts returned')

        this.actions.update({
          chainId: this.getChainId(),
          accounts: [address],
          accountIndex: address ? 0 : undefined,
        })
      })
      .catch((error: ProviderRpcError) => {
        console.debug('activate Could not connect eagerly', error)
        cancelActivation?.()
      })
  }

  public async watchAsset({ type, address, symbol, decimals, image }: WatchAssetParameters): Promise<boolean> {
    if (!this.customProvider) throw new Error('No provider')

    this.actions.update({
      watchingAsset: {
        address,
        symbol,
        decimals,
        image,
      },
    })

    return this.customProvider
      .request({
        method: 'wallet_watchAsset',
        params: {
          type: type ?? 'trc20', // trc10 or trc20
          options: {
            address, // The address that the token is at.
            symbol, // A ticker symbol or shorthand, up to 5 chars.
            decimals, // The number of decimals in the token
            image, // A string url of the token logo
          },
        },
      })
      .catch(() => {
        this.actions.update({ watchingAsset: undefined })
        return false
      })
      .then((res) => {
        const success = res as boolean
        this.actions.update({ watchingAsset: undefined })
        return success
      })
  }
}
