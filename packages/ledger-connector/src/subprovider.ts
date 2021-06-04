import { BaseWalletSubprovider } from "@0x/subproviders/lib/src/subproviders/base_wallet_subprovider"
import { PartialTxParams } from "@0x/subproviders"
import { Transaction } from "ethereumjs-tx"
import { WalletSubproviderErrors } from "@0x/subproviders/lib/src/types"
import { stripHexPrefix } from "ethereumjs-util"
import AppEth from "@ledgerhq/hw-app-eth"
import TransportHID from "@ledgerhq/hw-transport-webhid"
import TransportU2F from "@ledgerhq/hw-transport-u2f"

const getTransport = () => {
  // web hid supported
  if ("hid" in navigator) {
    return TransportHID.create()
  }
  // try U2F
  return TransportU2F.create()
};

/**
 * Subprovider for interfacing with a user's [Ledger Nano S](https://www.ledgerwallet.com/products/ledger-nano-s).
 * This subprovider intercepts all account related RPC requests (e.g message/transaction signing, etc...) and
 * re-routes them to a Ledger device plugged into the users computer.
 */
export class LedgerSubprovider extends BaseWalletSubprovider {
  private readonly _networkId: number
  private _baseDerivationPath: string
  public selectedAccountIndex: number = 0

  /**
   * Instantiates a LedgerSubprovider. Defaults to derivationPath set to `44'/60'/x'`.
   * TestRPC/Ganache defaults to `m/44'/60'/x'/0`, so set this in the configs if desired.
   * @param config Several available configurations
   * @return LedgerSubprovider instance
   */
  constructor({
    networkId,
    baseDerivationPath,
  }: {
    networkId: number
    baseDerivationPath?: string
  }) {
    super()
    this._networkId = networkId
    this._baseDerivationPath = baseDerivationPath || "m/44'/60'/x'/0"
  }
  /**
   * Retrieve the set derivation path
   * @returns derivation path
   */
  public getPath(): string {
    return this._baseDerivationPath
  }
  /**
   * Set a desired derivation path when computing the available user addresses
   * @param basDerivationPath The desired derivation path (e.g `44'/60'/0'`)
   */
  public setPath(basDerivationPath: string): void {
    this._baseDerivationPath = basDerivationPath
  }
  /**
   * Retrieve a users Ledger accounts. The accounts are derived from the derivationPath,
   * master public key and chain code. Because of this, you can request as many accounts
   * as you wish and it only requires a single request to the Ledger device. This method
   * is automatically called when issuing a `eth_accounts` JSON RPC request via your providerEngine
   * instance.
   * @param numberOfAccounts Number of accounts to retrieve (default: 10)
   * @param from
   * @return An array of accounts
   */
  public async getAccountsAsync(
    numberOfAccounts: number = 10,
    from: number = 0,
  ): Promise<string[]> {
    const addresses = []
    let transport = await getTransport()
    try {
      const eth = new AppEth(transport)
      for (let i = from; i < from + numberOfAccounts; i++) {
        const path = this._baseDerivationPath.replace("x", String(i))
        const info = await eth.getAddress(path, false, true)
        addresses.push(info.address)
      }
    } catch (e) {
      console.log(e)
    } finally {
      await transport.close()
    }
    return addresses
  }

  /**
   * Signs a transaction on the Ledger with the account specificed by the `from` field in txParams.
   * If you've added the LedgerSubprovider to your app's provider, you can simply send an `eth_sendTransaction`
   * JSON RPC request, and this method will be called auto-magically. If you are not using this via a ProviderEngine
   * instance, you can call it directly.
   * @param txParams Parameters of the transaction to sign
   * @return Signed transaction hex string
   */
  public async signTransactionAsync(txParams: PartialTxParams): Promise<string> {
    const path = this._baseDerivationPath.replace("x", this.selectedAccountIndex.toString())
    if (!path) throw new Error("address unknown '" + txParams.from + "'")
    let transport = await getTransport()
    try {
      const eth = new AppEth(transport)
      const tx = new Transaction(txParams, { chain: this._networkId })

      // Set the EIP155 bits
      tx.raw[6] = Buffer.from([this._networkId]) // v
      tx.raw[7] = Buffer.from([]) // r
      tx.raw[8] = Buffer.from([]) // s

      // Pass hex-rlp to ledger for signing
      const result = await eth.signTransaction(path, tx.serialize().toString("hex"))

      // Store signature in transaction
      tx.v = Buffer.from(result.v, "hex")
      tx.r = Buffer.from(result.r, "hex")
      tx.s = Buffer.from(result.s, "hex")

      // EIP155: v should be chain_id * 2 + {35, 36}
      const signedChainId = Math.floor((tx.v[0] - 35) / 2)
      const validChainId = this._networkId & 0xff; // FIXME this is to fixed a current workaround that app don't support > 0xff
      if (signedChainId !== validChainId) {
        throw LedgerSubprovider.makeError(
          "Invalid networkId signature returned. Expected: " +
            this._networkId +
            ", Got: " +
            signedChainId,
          "InvalidNetworkId",
        )
      }

      return `0x${tx.serialize().toString("hex")}`
    } finally {
      await transport.close()
    }
  }

  private static makeError(msg: string | undefined, id: string) {
    const err = new Error(msg)
    // @ts-ignore
    err.id = id
    return err
  }

  /**
   * Sign a personal Ethereum signed message. The signing account will be the account
   * associated with the provided address.
   * The Ledger adds the Ethereum signed message prefix on-device.  If you've added
   * the LedgerSubprovider to your app's provider, you can simply send an `eth_sign`
   * or `personal_sign` JSON RPC request, and this method will be called auto-magically.
   * If you are not using this via a ProviderEngine instance, you can call it directly.
   * @param data Hex string message to sign
   * @param address Address of the account to sign with
   * @return Signature hex string (order: rsv)
   */
  public async signPersonalMessageAsync(data: string, address: string): Promise<string> {
    const path = this._baseDerivationPath.replace("x", this.selectedAccountIndex.toString())
    if (!path) throw new Error("address unknown '" + address + "'")
    let transport = await getTransport()
    try {
      const eth = new AppEth(transport)
      const result = await eth.signPersonalMessage(path, stripHexPrefix(data))
      const v = parseInt(result.v.toString(), 10) - 27
      let vHex = v.toString(16)
      if (vHex.length < 2) {
        vHex = `0${v}`
      }
      return `0x${result.r}${result.s}${vHex}`
    } finally {
      await transport.close()
    }
  }
  /**
   * eth_signTypedData is currently not supported on Ledger devices.
   * @return Signature hex string (order: rsv)
   */
  public async signTypedDataAsync(): Promise<string> {
    throw new Error(WalletSubproviderErrors.MethodNotSupported)
  }
}
