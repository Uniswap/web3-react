# `web3-react` Documentation - Ledger

- [Install](#install)
- [Arguments](#arguments)
- [Example](#example)

## Install

`yarn add @web3-react/ledger-connector`

## Arguments

```typescript
chainId: number
url: string
pollingInterval?: number
requestTimeoutMs?: number
accountFetchingConfigs?: any
baseDerivationPath?: string
```

## Example

```javascript
import { LedgerConnector, LedgerPath } from '@web3-react/ledger-connector'

const ledger = new LedgerConnector({ chainId: 5, url: 'https://goerli.infura.io/v3/xxxxxxx' })

// ...
// Activate the connection
await activate(ledger)

// Set the location
await ledger.setPath(LedgerPath.Legacy)

// Get the first 100 accounts in LedgerPath.Legacy
const accounts = ledger.getAccounts(100)

// Set the account to the 11th one
await ledger.setAccount(accounts[10])
```

## Paths

There are 2 paths available:

```javascript
enum LedgerPath {
    Legacy = "44'/60'/0'",
    Live = "44'/60'/0'/0"
}
```
