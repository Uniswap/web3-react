# Hooks

NOTE: The custom hooks exported by `web3-react` are a WIP. They are not fully documented, not in their final form, and will in all likelihood perform/change unexpectedly.

The implementation for hooks is in [src/hooks.ts](../src/hooks.ts).

All hooks are available via:

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

### `useNetworkName`

Returns the name of a network (defaults to the current network).

```javascript
useNetworkName(networkId?: number)
```

```javascript
const networkName = useNetworkName(...)
```

### `useEtherscanLink`

Returns an [Etherscan](https://etherscan.io/) link (defaults to the current network).

```javascript
useEtherscanLink(type: string, data: string, networkId?: number)
```

```javascript
const link = useEtherscanLink(...)
```

### `useSignPersonalManager`

Wraps the `signPersonal` utility function with current `Web3Context` values.

```javascript
useSignPersonal(message: string,  { handlers = {} })
```

`handlers` must be one of: `['success', 'error']`.

```javascript
const [signatureState, signatureData, signPersonal, resetSignature] = useSignPersonalManager(message)
```

### `useTransactionManager`

Wraps the `sendTransaction` utility function with current `Web3Context` values.

```javascript
useSendTransaction(method, ({ handlers = {}, transactionOptions = {}, maximumConfirmations = null } = {}))
```

`handlers` must be one of: `['transactionHash', 'receipt', 'confirmation', 'error']`.

```javascript
const [sendTransaction, transactionErrors] = useSendTransaction()
```
