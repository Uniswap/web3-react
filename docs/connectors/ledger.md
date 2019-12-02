# `web3-react` Documentation - Ledger Connector

- [Install](#install)
- [Arguments](#arguments)
- [Example](#example)

## Install
`yarn add @web3-react/ledger-connector`

## Arguments
```typescript
interface LedgerConnectorArguments {
  chainId: number
  url: string
  pollingInterval?: number
  requestTimeoutMs?: number
  accountFetchingConfigs?: any
  baseDerivationPath?: string
}
```

## Example
```javascript
import { LedgerConnector } from '@web3-react/ledger-connector'

const ledger = new LedgerConnector({ chainId: 1, url: '...' })
```