# `web3-react` Documentation - Fortmatic Connector

- [Install](#install)
- [Arguments](#arguments)
- [Example](#example)

## Install
`yarn add @web3-react/fortmatic-connector`

## Arguments
```typescript
interface FortmaticConnectorArguments {
  apiKey: string
  chainId: number
}
```

## Example
```javascript
import { FortmaticConnector } from '@web3-react/fortmatic-connector'

const fortmatic = new FortmaticConnector({ apiKey: '...', chainId: 4 })
```