# `web3-react` Documentation - Torus Connector

- [Install](#install)
- [Arguments](#arguments)
- [Example](#example)

## Install
`yarn add @web3-react/torus-connector`

## Arguments
```typescript
interface TorusConnectorArguments {
  chainId: number
  initOptions?: any
  constructorOptions?: any
}
```

## Example
```javascript
import { TorusConnector } from '@web3-react/torus-connector'

const torus = new TorusConnector({ chainId: 1 })
```