# Utilities

This README documents the utility functions available through Web3 React. The implementation is in [src/web3Utilities.js](../src/web3Utilities.js).

## Functions

### `getNetworkName`
```javascript
getNetworkName(networkId)
```
Returns the name of a network. Possible return values: `Mainnet`, `Ropsten`, `Rinkeby`, or `Kovan`.

### `getEtherscanLink`
```javascript
getEtherscanLink(networkId, type, data)
```
Returns an [Etherscan](https://etherscan.io/) link.
- `type`: `String`, one of [`transaction`, `address`, `token`]

### `getAccountBalance`
```javascript
getAccountBalance(web3js, address, format = 'ether')
```
Returns the balance of an Ethereum address.

### `getERC20Balance`
```javascript
getERC20Balance(web3js, ERC20Address, address)
```
Returns the token balance of an Ethereum address for any ERC20. Decimals are read from the smart contract.

### `signPersonal`
```javascript
signPersonal(web3js, address, message)
```
Signs a message with the current account per [this article](https://medium.com/metamask/the-new-secure-way-to-sign-data-in-your-browser-6af9dd2a1527). Returns the signing address, message hash, and signature. The returned signature is guaranteed to have originated from the passed address.

### `sendTransaction`
```javascript
sendTransaction(web3js, address, method, handlers = {}, transactionOptions = {})
```
Manages a transaction sending flow. Ensures that function calls won't fail given the current state of the network, that the sender has enough ether to cover the gas costs of the transaction, and calls [`handlers` appropriately]((https://web3js.readthedocs.io/en/1.0/web3-eth.html#eth-sendtransaction-return)).

- `method`: Function or web3.js method.
- `handlers`: `Object` that can optionally include `transactionHash`, `receipt`, and/or `confirmation` handlers.
- `transactionOptions`: `Object` that can optionally include `gasPrice`, `gas`, and/or `value` keys.

### `TRANSACTION_ERRORS`
```javascript
const TRANSACTION_ERROR_CODES = [
  'GAS_PRICE_UNAVAILABLE', 'FAILING_TRANSACTION', 'SENDING_BALANCE_UNAVAILABLE','INSUFFICIENT_BALANCE'
]
```
Errors thrown by [sendTransaction](#sendtransaction) may have a code in the above list, in which case users can be alerted as to why specifically their transaction failed.

### `toDecimal`
```javascript
toDecimal(number, decimals)
```
Returns a decimalized version of the `number` as a `String`. Helpful when converting e.g. token balances from their `uint256` state in an Ethereum smart contract to actual balances.

- `number`: `String`
- `decimals`: `Number`

### `fromDecimal`
```javascript
fromDecimal(number, decimals)
```
The opposite of [toDecimal](#todecimal), i.e. converts the number to an expanded form.

- `number`: `String`
- `decimals`: `Number`
