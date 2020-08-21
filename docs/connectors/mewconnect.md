# `web3-react` Documentation - MEWconnect

- [Install](#install)
- [Arguments](#arguments)
- [Example](#example)


To add MEWconnect Protocol to Web3-React using the mewconnect-connector for MEWconnect Protocol

## Install:
`yarn add @myetherwallet/mewconnect-connector`

## Arguments
```typescript
    url: string; //(optional if infuraId is provided)
    infuraId?: string; //(optional if url is provided)
    windowClosedError?: boolean; //(optional)
    subscriptionNotFoundNoThrow?: boolean; //(optional)
```

## Example
```javascript
import { MewConnectConnector } from '@myetherwallet/mewconnect-connector'

const mewconnect = new MewConnectConnector({
  url: 'some rpc url'
})
```
