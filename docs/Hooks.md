# Hooks

This README documents the Hooks available through Web3 React. The implementation is in [src/web3Hooks.js](../src/web3Hooks.js).

## Hooks
```javascript
import { ... } from 'web3-react/hooks'
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
useEtherscanLink(networkId, type, data)
```
```javascript
const link = useEtherscanLink(...)
```

### `useAccountEffect`
useAccountEffect(effect, depends)
```javascript
useAccountEffect(effect, depends)
```
```javascript
useAccountEffect(() => { ... }, [...])
```

### `useNetworkEffect`
Identical to `useEffect`, except that it also triggers on network re-renders.
```javascript
useNetworkEffect(effect, depends)
```
```javascript
useNetworkEffect(() => { ... }, [...])
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

### `useSignPersonal`
Wraps the `signPersonal` utility function with current `Web3Context` values.
```javascript
useSignPersonal()
```
```javascript
const [ signPersonal ] = useSignPersonal()
```

### `useSendTransaction`
Wraps the `sendTransaction` utility function with current `Web3Context` values.
```javascript
useSendTransaction()
```
```javascript
const [ sendTransaction, transactionErrors ] = useSendTransaction()
```
