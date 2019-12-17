# `web3-react` Documentation - Portis

- [Install](#install)
- [Arguments](#arguments)
- [Example](#example)

## Install
`yarn add @web3-react/portis-connector`

## Arguments
```typescript
dAppId: string
networks: (number | { chainId: string; [key: string]: any })[]
config?: any
```

## Example
```javascript
import { PortisConnector } from '@web3-react/portis-connector'

const portis = new PortisConnector({ dAppId: '...', networks: [1, 100] })
```

Note: Once the connector has been activated, the Portis SDK instance can be accessed under the `.portis` property.
