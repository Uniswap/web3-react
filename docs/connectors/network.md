# `web3-react` Documentation - Network Connector

- [Install](#install)
- [Arguments](#arguments)
- [Example](#example)

## Install
`yarn add @web3-react/network-connector`

## Arguments
```typescript
interface NetworkConnectorArguments {
  urls: { [chainId: number]: string }
  defaultChainId?: number
  pollingInterval?: number
  requestTimeoutMs?: number
}
```

## Example
```javascript
import { NetworkConnector } from '@web3-react/network-connector'

const network = new NetworkConnector({ urls: { 1: RPC_URLS[1] } })
```