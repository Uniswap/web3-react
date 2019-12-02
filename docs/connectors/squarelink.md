# `web3-react` Documentation - Squarelink Connector

- [Install](#install)
- [Arguments](#arguments)
- [Example](#example)

## Install
`yarn add @web3-react/squarelink-connector`

## Arguments
```typescript
interface SquarelinkConnectorArguments {
  clientId: string
  networks: (number | { chainId: number; [key: string]: any })[]
  options?: any
}
```

## Example
```javascript
import { SquarelinkConnector } from '@web3-react/squarelink-connector'

const squarelink = new SquarelinkConnector({
  clientId: '...',
  networks: [1, 100]
})
```