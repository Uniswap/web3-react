import type { ConnectorArgs, Provider, Web3ReactState } from '@web3-react/types'
import { Connector } from '@web3-react/types'

// https://cips.cardano.org/cips/cip30/
// https://github.com/berry-pool/nami

export const testChainId = 1400000000
export const mainChainId = 1400000001

export const getChainIdForNetworkId = (networkId: CardanoChain) => {
  return networkId === 0 ? testChainId : mainChainId
}

// 0 - Testnet, 1 - Mainnet
export type CardanoChain = 0 | 1
export type Bytes = string
export type Address = string
export type CBOR = string

export type Paginate = {
  page: number
  limit: number
}

export type APIErrorCode = {
  InvalidRequest: -1
  InternalError: -2
  Refused: -3
  AccountChange: -4
}

export type APIError = {
  code: APIErrorCode
  info: string
}

export type CIP30Event = 'accountChange' | 'networkChange' | 'connect' | 'disconnect' | 'utxoChange'

export type InitialAPI = {
  apiVersion: string
  icon: string
  name: string
  enable: () => Promise<FullAPI>
  isEnabled: () => Promise<boolean>
}

export type FullAPI = {
  experimental: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    on: (eventName: CIP30Event, callback: (arg: any) => void) => void
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    off: (eventName: CIP30Event, callback: (arg: any) => void) => void
    getCollateral: (params: { amount: CBOR }) => Promise<unknown>
  }

  getNetworkId: () => Promise<CardanoChain>
  getUtxos: (amount?: CBOR, paginate?: Paginate) => Promise<unknown>
  getBalance: (tokenId?: string) => Promise<string>
  getUsedAddresses: (paginate?: Paginate) => Promise<string[]>
  getUnusedAddresses: () => Promise<string[]>
  getChangeAddress: () => Promise<string[]>
  getRewardAddresses: () => Promise<string[]>
  signTx: (tx: CBOR, partialSign?: boolean) => Promise<unknown>
  signData: (addr: Address, payload: Bytes) => Promise<unknown>
  submitTx: (tx: CBOR) => Promise<unknown>
}

export type NamiProvider = Provider & FullAPI

declare global {
  interface Window {
    cardano?: { nami: InitialAPI }
  }
}

type NamiWalletOptions = {
  //
}

export function bytesToHex(bytes: Bytes) {
  return Buffer.from(bytes).toString('hex')
}

export function hexToBytes(hex: string) {
  return Buffer.from(hex, 'hex')
}

export class NoNamiProviderError extends Error {
  public constructor() {
    super('Nami Wallet not installed')
    this.name = NoNamiProviderError.name
    Object.setPrototypeOf(this, NoNamiProviderError.prototype)
  }
}

/**
 * @param options - Options to pass to the "BinanceChain" provider.
 * @param onError - Handler to report errors thrown from eventListeners.
 */
export interface NamiConstructorArgs extends ConnectorArgs {
  options?: NamiWalletOptions
}

export class NamiWallet extends Connector {
  /** {@inheritdoc Connector.provider} */
  public readonly provider: undefined
  /** {@inheritdoc Connector.customProvider} */
  public customProvider?: FullAPI

  public initialApi?: InitialAPI

  private readonly options?: NamiWalletOptions

  constructor({ actions, options, onError, connectorOptions }: NamiConstructorArgs) {
    super(actions, onError, {
      ...connectorOptions,
      supportedChainIds: connectorOptions?.supportedChainIds ?? [],
    })
    this.options = options
  }

  private isomorphicInitialize() {
    if (this.initialApi) return

    if (window?.cardano?.nami) {
      this.initialApi = window.cardano.nami as InitialAPI
    }
  }

  private updateProvider(api: FullAPI) {
    this.customProvider = api

    this.customProvider.experimental.on('disconnect', (): void => {
      this.actions.resetState()
    })

    this.customProvider.experimental.on('networkChange', (networkId: CardanoChain): void => {
      this.actions.update({ chainId: getChainIdForNetworkId(networkId) })
    })

    this.customProvider.experimental.on('accountChange', (accounts: string[]): void => {
      const walletId = accounts[0]

      if (accounts.length === 0 || !walletId) {
        this.actions.resetState()
      } else {
        this.actions.update({ accounts: [walletId], accountIndex: walletId ? 0 : undefined }, true)
      }
    })
  }

  /** {@inheritdoc Connector.connectEagerly} */
  public async connectEagerly(): Promise<Web3ReactState> {
    this.isomorphicInitialize()

    if (!this.initialApi) return this.actions.getState()

    const cancelActivation = this.actions.startActivation()

    return this.initialApi
      .enable()
      .then(async (api) => {
        this.updateProvider(api)

        if (await this.initialApi?.isEnabled()) {
          const walletId = (await api.getUsedAddresses())[0]
          const networkId = await api.getNetworkId()

          if (walletId) {
            return this.actions.update(
              {
                chainId: this.parseChainId(getChainIdForNetworkId(networkId)),
                accounts: [walletId],
                accountIndex: walletId ? 0 : undefined,
              },
              true
            )
          } else {
            throw new Error('No accounts returned')
          }
        } else {
          return cancelActivation()
        }
      })
      .catch((error: APIError) => {
        console.debug('Could not connect eagerly', error)
        return cancelActivation()
      })
  }

  /**
   * Initiates a connection.
   */
  public async activate(): Promise<Web3ReactState> {
    this.isomorphicInitialize()

    if (!this.initialApi) throw new NoNamiProviderError()

    const cancelActivation = this.actions.startActivation()

    return this.initialApi
      .enable()
      .then(async (api) => {
        this.updateProvider(api)

        if (await this.initialApi?.isEnabled()) {
          const walletId = (await api.getUsedAddresses())[0]
          const networkId = await api.getNetworkId()

          if (walletId) {
            return this.actions.update(
              {
                chainId: this.parseChainId(getChainIdForNetworkId(networkId)),
                accounts: [walletId],
                accountIndex: walletId ? 0 : undefined,
              },
              true
            )
          } else {
            throw new Error('No accounts returned')
          }
        } else {
          return cancelActivation()
        }
      })
      .catch((error: APIError) => {
        cancelActivation()
        throw error
      })
  }
}
