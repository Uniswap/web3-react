import type { ConnectorArgs, Provider } from '@web3-react/types'
import { Connector } from '@web3-react/types'

// https://cips.cardano.org/cips/cip30/
// https://github.com/Emurgo/yoroi-frontend/blob/develop/packages/yoroi-connector/src/inject.js

// export const testMagic = 1097911063
// export const previewMagic = 2
// export const preProdMagic = 1
// export const mainMagic = 764824073

export const testChainId = 1400000000
export const mainChainId = 1400000001

export const getChainIdForNetworkId = (networkId: CardanoChain) => {
  return networkId === 0 ? testChainId : mainChainId
}

// 0 - Testnet, 1 - Mainnet
export type CardanoChain = 0 | 1
export type CardanoNetwork = 'mainnet' | 'testnet' | 'preview' | 'preprod'
export type Bytes = string
export type Address = string
export type CBOR = string
export type ReturnType = 'cbor' | 'json'

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

export type Auth = {
  isEnabled: () => boolean
  getWalletId: () => Promise<string>
  getWalletPubkey: () => Promise<string>
  signHexPayload: (hex: string) => Promise<string>
  checkHexPayload: (hex: string, sign: string) => Promise<boolean>
}

export type InitialAPI = {
  apiVersion: string
  icon: string
  name: string
  enable: ({
    requestIdentification,
    onlySilent,
  }: {
    requestIdentification: boolean
    onlySilent: boolean
  }) => Promise<FullAPI>
  isEnabled: () => boolean
}

export type FullAPI = {
  experimental: {
    auth: () => Auth
    createTx: (txInfo: unknown) => void
    listNFTs: () => void
    onDisconnect: (callback: () => void) => void
    setReturnType: (returnType: ReturnType) => void
  }

  getNetworkId: () => Promise<CardanoChain>
  getUtxos: (amount?: CBOR, paginate?: Paginate) => Promise<unknown>
  getCollateral: (params: { amount: CBOR }) => Promise<unknown>
  getBalance: (tokenId?: string) => Promise<string>
  getUsedAddresses: (paginate?: Paginate) => Promise<string[]>
  getUnusedAddresses: () => Promise<string[]>
  getChangeAddress: () => Promise<string[]>
  getRewardAddresses: () => Promise<string[]>
  signTx: (tx: CBOR, partialSign?: boolean) => Promise<unknown>
  signData: (addr: Address, payload: Bytes) => Promise<unknown>
  submitTx: (tx: CBOR) => Promise<unknown>
}

export type YoroiProvider = Provider & FullAPI

declare global {
  interface Window {
    cardano?: { yoroi: InitialAPI }
  }
}

type YoroiWalletOptions = {
  returnType?: ReturnType
}

export class NoYoroiProviderError extends Error {
  public constructor() {
    super('Yoroi Wallet not installed')
    this.name = NoYoroiProviderError.name
    Object.setPrototypeOf(this, NoYoroiProviderError.prototype)
  }
}

/**
 * @param options - Options to pass to the "BinanceChain" provider.
 * @param onError - Handler to report errors thrown from eventListeners.
 */
export interface YoroiConstructorArgs extends ConnectorArgs {
  options?: YoroiWalletOptions
}

export class YoroiWallet extends Connector {
  /** {@inheritdoc Connector.provider} */
  public readonly provider: undefined
  /** {@inheritdoc Connector.customProvider} */
  public customProvider?: FullAPI

  public initialApi?: InitialAPI
  public auth?: Auth

  private readonly options?: YoroiWalletOptions

  constructor({ actions, options, onError, connectorOptions }: YoroiConstructorArgs) {
    super(actions, onError, {
      ...connectorOptions,
      supportedChainIds: connectorOptions?.supportedChainIds ?? [],
    })
    this.options = { ...options, returnType: options?.returnType ?? 'cbor' }
  }

  private isomorphicInitialize() {
    if (this.initialApi) return

    if (window?.cardano?.yoroi) {
      this.initialApi = window.cardano.yoroi as InitialAPI
    }
  }

  private updateProvider(api: FullAPI) {
    this.customProvider = api
    this.customProvider.experimental.setReturnType(this.options?.returnType ?? 'cbor')
    this.customProvider.experimental.onDisconnect(() => {
      this.actions.resetState()
    })
  }

  /** {@inheritdoc Connector.connectEagerly} */
  public async connectEagerly(): Promise<void> {
    this.isomorphicInitialize()

    const cancelActivation = !this.initialApi ? null : this.actions.startActivation()

    if (!this.initialApi) return

    return this.initialApi
      .enable({ requestIdentification: true, onlySilent: true })
      .then(async (api) => {
        this.updateProvider(api)

        this.auth = this.customProvider?.experimental.auth()

        if (this.auth?.isEnabled()) {
          const walletId = await this.auth.getWalletId()
          const networkId = await api.getNetworkId()

          if (walletId) {
            this.actions.update(
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
          cancelActivation?.()
        }
      })
      .catch((error: APIError) => {
        console.debug('Could not connect eagerly', error)
        cancelActivation?.()
      })
  }

  /**
   * Initiates a connection.
   */
  public async activate(): Promise<void> {
    this.isomorphicInitialize()

    const cancelActivation = !this.initialApi ? null : this.actions.startActivation()

    if (!this.initialApi) throw new NoYoroiProviderError()

    return this.initialApi
      .enable({ requestIdentification: true, onlySilent: false })
      .then(async (api) => {
        this.updateProvider(api)

        this.auth = api.experimental.auth()

        if (this.auth.isEnabled()) {
          const walletId = await this.auth.getWalletId()
          const networkId = await api.getNetworkId()

          if (walletId) {
            this.actions.update(
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
          cancelActivation?.()
        }
      })
      .catch((error: APIError) => {
        cancelActivation?.()
        throw error
      })
  }
}
