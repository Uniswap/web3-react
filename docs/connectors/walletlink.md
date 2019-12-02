# `web3-react` Documentation - WalletLink Connector

- [Install](#install)
- [Arguments](#arguments)
- [Example](#example)

## Install
`yarn add @web3-react/walletlink-connector`

## Arguments
```typescript
interface WalletLinkConnectorArguments {
  url: string
  appName: string
  appLogoUrl?: string
}
```

## Example
```javascript
import { WalletConnectConnector } from '@web3-react/walletconnect-connector'

const walletlink = new WalletLinkConnector({ url: '...', appName: '...' })
```
