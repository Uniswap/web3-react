# `web3-react` Documentation - Authereum Connector

- [Install](#install)
- [Arguments](#arguments)
- [Example](#example)

## Install
`yarn add @web3-react/authereum-connector`

## Arguments
```typescript
interface AuthereumConnectorArguments {
  chainId: number
}
```

## Example
```javascript
import { AuthereumConnector } from '@web3-react/authereum-connector'

const authereum = new AuthereumConnector({ chainId: 42 })
```