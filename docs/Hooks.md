# Hooks

This README documents the Hooks available through Web3 React. The implementation is in [src/web3Hooks.js](../src/web3Hooks.js).

## Available Hooks
All hooks are available like so:
```javascript
import { ... } from 'web3-react/hooks'
```

### `useReRendererEffect`
Identical to `useEffect`, except that it also triggers on account and network re-renders.

```javascript
useReRendererEffect(effect, depends)

useReRendererEffect(() => { ... }, [...])
```

### `useAccountBalance`
Fetches the current account's ETH balance.
```javascript
useAccountBalance({numberOfDigits = 3, format = 'ether'} = {})

const [ balance ] = useAccountBalance()
```

### `useERC20Balance`
Fetches the current account's balance of the passed ERC20 token.
```javascript
useERC20Balance(ERC20Address, numberOfDigits = 3)

const [ ERC20Balance ] = useERC20Balance(...)
```
