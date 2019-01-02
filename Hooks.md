# Hooks

This README documents the Hooks available through Web3 React. The implementation is in [src/web3Hooks.js](../src/web3Hooks.js).

## Hooks
```javascript
import { ... } from 'web3-react/hooks'
```

### `useWeb3Context`
Exposes the `Web3Context`.
```javascript
useWeb3Context()
```
```javascript
const context = useWeb3Context()
```

### `useAccountEffect`
useAccountEffect(effect, depends = [])
```javascript
useAccountEffect(effect, depends)
```
```javascript
useAccountEffect(() => { ... }, [...])
```

### `useNetworkEffect`
Identical to `useEffect`, except that it also triggers on network re-renders.
```javascript
useNetworkEffect(effect, depends = [])
```
```javascript
useNetworkEffect(() => { ... }, [...])
```

### `useNetworkName`
Returns the name of a network (defaults to the current network).
```javascript
useNetworkName(networkId)
```
```javascript
const networkName = useNetworkName()
```

### `useEtherscanLink`
Returns an [Etherscan](https://etherscan.io/) link (defaults to the current network).
```javascript
useEtherscanLink(type, data, networkId)
```
```javascript
const link = useEtherscanLink(...)
```

### `useAccountBalance`
Fetches the ETH balance of an account (defaults to the current account).
```javascript
useAccountBalance(address, {numberOfDigits = 3, format} = {})
```
```javascript
const [ balance ] = useAccountBalance()
```

### `useERC20Balance`
Fetches the ETH balance of an account (defaults to the current account).
```javascript
useERC20Balance(ERC20Address, address, numberOfDigits = 3)
```
```javascript
const [ ERC20Balance ] = useERC20Balance()
```

### `useSignPersonalManager`
Wraps the `signPersonal` utility function with current `Web3Context` values.
```javascript
useSignPersonal(message,  { handlers = {} })
```
`handlers` must be one of: `['success', 'error']`.
```javascript
const [signatureState, signatureData, signPersonal, resetSignature] = useSignPersonalManager(message)
```

### `useTransactionManager`
Wraps the `sendTransaction` utility function with current `Web3Context` values.
```javascript
useSendTransaction(method, { handlers = {}, transactionOptions = {}, maximumConfirmations = null } = {})
```
`handlers` must be one of: `['transactionHash', 'receipt', 'confirmation', 'error']`.
```javascript
const [ sendTransaction, transactionErrors ] = useSendTransaction()
```
