// copied from https://github.com/0xProject/0x-monorepo/pull/1431
import { assert } from '@0x/assert'
import { addressUtils } from '@0x/utils'
import EthereumTx = require('ethereumjs-tx')
import * as _ from 'lodash'

import HDNode = require('hdkey')

interface AccountFetchingConfigs {
  addressSearchLimit?: number
  numAddressesToReturn?: number
  shouldAskForOnDeviceConfirmation?: boolean
}

interface TrezorSubproviderConfig {
  accountFetchingConfigs: AccountFetchingConfigs
  trezorConnectClientApi: any
  networkId: number
}

interface TrezorGetPublicKeyResponsePayload {
  path: {
    [index: number]: number
  }
  serializedPath: string
  childNumb: number
  xpub: string
  chainCode: string
  publicKey: string
  fingerprint: number
  depth: number
}

interface TrezorSignTxResponsePayload {
  v: string
  r: string
  s: string
}

interface TrezorSignMsgResponsePayload {
  address: string
  signature: string
}

interface TrezorResponseErrorPayload {
  error: string
}

interface TrezorConnectResponse {
  payload: any
  id: number
  success: boolean
}

import { DerivedHDKeyInfo, PartialTxParams, WalletSubproviderErrors } from '@0x/subproviders/lib/src/types'
import { walletUtils } from '@0x/subproviders/lib/src/utils/wallet_utils'

import { BaseWalletSubprovider } from '@0x/subproviders/lib/src/subproviders/base_wallet_subprovider'

const PRIVATE_KEY_PATH = `44'/60'/0'/0`
const DEFAULT_NUM_ADDRESSES_TO_FETCH = 10
const DEFAULT_ADDRESS_SEARCH_LIMIT = 1000

export default class TrezorSubprovider extends BaseWalletSubprovider {
  private readonly _privateKeyPath: string
  private readonly _trezorConnectClientApi: any
  private readonly _networkId: number
  private readonly _addressSearchLimit: number
  private _initialDerivedKeyInfo: any
  /**
   * Instantiates a TrezorSubprovider. Defaults to private key path set to `44'/60'/0'/0/`.
   * Must be initialized with trezor-connect API module https://github.com/trezor/connect.
   * @param TrezorSubprovider config object containing trezor-connect API
   * @return TrezorSubprovider instance
   */
  public constructor(config: TrezorSubproviderConfig) {
    super()
    this._privateKeyPath = PRIVATE_KEY_PATH
    this._trezorConnectClientApi = config.trezorConnectClientApi
    this._networkId = config.networkId
    const _addressSearchLimit =
      !_.isUndefined(config.accountFetchingConfigs) &&
      !_.isUndefined(config.accountFetchingConfigs.addressSearchLimit) &&
      config.accountFetchingConfigs.addressSearchLimit
    this._addressSearchLimit = _addressSearchLimit || DEFAULT_ADDRESS_SEARCH_LIMIT
  }
  /**
   * Retrieve a users Trezor account. This method is automatically called
   * when issuing a `eth_accounts` JSON RPC request via your providerEngine
   * instance.
   * @return An array of accounts
   */
  public async getAccountsAsync(numberOfAccounts: number = DEFAULT_NUM_ADDRESSES_TO_FETCH): Promise<string[]> {
    const initialDerivedKeyInfo = await this._initialDerivedKeyInfoAsync()
    const derivedKeyInfos = walletUtils.calculateDerivedHDKeyInfos(initialDerivedKeyInfo, numberOfAccounts)
    const accounts = _.map(derivedKeyInfos, (k: any): any => k.address)
    return accounts
  }
  /**
   * Signs a transaction on the Trezor with the account specificed by the `from` field in txParams.
   * If you've added the TrezorSubprovider to your app's provider, you can simply send an `eth_sendTransaction`
   * JSON RPC request, and this method will be called auto-magically. If you are not using this via a ProviderEngine
   * instance, you can call it directly.
   * @param txParams Parameters of the transaction to sign
   * @return Signed transaction hex string
   */
  public async signTransactionAsync(txData: PartialTxParams): Promise<string> {
    if (_.isUndefined(txData.from) || !addressUtils.isAddress(txData.from)) {
      throw new Error(WalletSubproviderErrors.FromAddressMissingOrInvalid)
    }
    txData.value = txData.value ? txData.value : '0x0'
    txData.data = txData.data ? txData.data : '0x'
    txData.gas = txData.gas ? txData.gas : '0x0'
    txData.gasPrice = txData.gasPrice ? txData.gasPrice : '0x0'

    const initialDerivedKeyInfo = await this._initialDerivedKeyInfoAsync()
    const derivedKeyInfo = this._findDerivedKeyInfoForAddress(initialDerivedKeyInfo, txData.from)
    const fullDerivationPath = derivedKeyInfo.derivationPath

    const response: TrezorConnectResponse = await this._trezorConnectClientApi.ethereumSignTransaction({
      path: fullDerivationPath,
      transaction: {
        to: txData.to,
        value: txData.value,
        data: txData.data,
        chainId: this._networkId,
        nonce: txData.nonce,
        gasLimit: txData.gas,
        gasPrice: txData.gasPrice
      }
    })

    if (response.success) {
      const payload: TrezorSignTxResponsePayload = response.payload
      const tx = new EthereumTx(txData)

      // Set the EIP155 bits
      const vIndex = 6
      // eslint-disable-next-line
      tx.raw[vIndex] = Buffer.from([1]) // v
      const rIndex = 7
      // eslint-disable-next-line
      tx.raw[rIndex] = Buffer.from([]) // r
      const sIndex = 8
      // eslint-disable-next-line
      tx.raw[sIndex] = Buffer.from([]) // s

      // slice off leading 0x
      // eslint-disable-next-line
      tx.v = Buffer.from(payload.v.slice(2), 'hex')
      // eslint-disable-next-line
      tx.r = Buffer.from(payload.r.slice(2), 'hex')
      // eslint-disable-next-line
      tx.s = Buffer.from(payload.s.slice(2), 'hex')

      return `0x${tx.serialize().toString('hex')}`
    } else {
      const payload: TrezorResponseErrorPayload = response.payload
      throw new Error(payload.error)
    }
  }
  /**
   * Sign a personal Ethereum signed message. The signing account will be the account
   * associated with the provided address. If you've added the TrezorSubprovider to
   * your app's provider, you can simply send an `eth_sign` or `personal_sign` JSON RPC
   * request, and this method will be called auto-magically.
   * If you are not using this via a ProviderEngine instance, you can call it directly.
   * @param data Hex string message to sign
   * @param address Address of the account to sign with
   * @return Signature hex string (order: rsv)
   */
  public async signPersonalMessageAsync(data: string, address: string): Promise<string> {
    if (_.isUndefined(data)) {
      throw new Error(WalletSubproviderErrors.DataMissingForSignPersonalMessage)
    }
    assert.isHexString('data', data)
    assert.isETHAddressHex('address', address)

    const initialDerivedKeyInfo = await this._initialDerivedKeyInfoAsync()
    const derivedKeyInfo = this._findDerivedKeyInfoForAddress(initialDerivedKeyInfo, address)
    const fullDerivationPath = derivedKeyInfo.derivationPath

    const response: TrezorConnectResponse = await this._trezorConnectClientApi.ethereumSignMessage({
      path: fullDerivationPath,
      message: data,
      hex: false
    })

    if (response.success) {
      const payload: TrezorSignMsgResponsePayload = response.payload
      return `0x${payload.signature}`
    } else {
      const payload: TrezorResponseErrorPayload = response.payload
      throw new Error(payload.error)
    }
  }
  /**
   * TODO:: eth_signTypedData is currently not supported on Trezor devices.
   * @param address Address of the account to sign with
   * @param data the typed data object
   * @return Signature hex string (order: rsv)
   */
  public async signTypedDataAsync(): Promise<string> {
    throw new Error(WalletSubproviderErrors.MethodNotSupported)
  }
  private async _initialDerivedKeyInfoAsync(): Promise<DerivedHDKeyInfo> {
    if (this._initialDerivedKeyInfo) {
      return this._initialDerivedKeyInfo
    } else {
      const parentKeyDerivationPath = `m/${this._privateKeyPath}`

      const response: TrezorConnectResponse = await this._trezorConnectClientApi.getPublicKey({
        path: parentKeyDerivationPath
      })

      if (response.success) {
        const payload: TrezorGetPublicKeyResponsePayload = response.payload
        const hdKey = new HDNode()
        // eslint-disable-next-line
        hdKey.publicKey = new Buffer(payload.publicKey, 'hex')
        // eslint-disable-next-line
        hdKey.chainCode = new Buffer(payload.chainCode, 'hex')
        const address = walletUtils.addressOfHDKey(hdKey)
        const initialDerivedKeyInfo = {
          hdKey,
          address,
          derivationPath: parentKeyDerivationPath,
          baseDerivationPath: this._privateKeyPath
        }
        this._initialDerivedKeyInfo = initialDerivedKeyInfo
        return initialDerivedKeyInfo
      } else {
        const payload: TrezorResponseErrorPayload = response.payload
        throw new Error(payload.error)
      }
    }
  }
  private _findDerivedKeyInfoForAddress(initalHDKey: DerivedHDKeyInfo, address: string): DerivedHDKeyInfo {
    const matchedDerivedKeyInfo = walletUtils.findDerivedKeyInfoForAddressIfExists(
      address,
      initalHDKey,
      this._addressSearchLimit
    )
    if (_.isUndefined(matchedDerivedKeyInfo) || matchedDerivedKeyInfo === undefined) {
      throw new Error(`${WalletSubproviderErrors.AddressNotFound}: ${address}`)
    }
    return matchedDerivedKeyInfo
  }
}
