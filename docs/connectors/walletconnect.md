# `web3-react` Documentation - WalletConnect

- [Install](#install)
- [Arguments](#arguments)
- [Example](#example)
- [Events](#events)
  - [URI_AVAILABLE](#uri_available)
    - [Example](#example-1)
- [Errors](#errors)
  - [UserRejectedRequestError](#userrejectedrequesterror)
    - [Example](#example-2)

## Install
`yarn add @web3-react/walletconnect-connector`

## Arguments
```typescript
rpc: { [chainId: number]: string }
bridge?: string
qrcode?: boolean
pollingInterval?: number
```

## Example
```javascript
import { WalletConnectConnector } from '@web3-react/walletconnect-connector'

const walletconnect = new WalletConnectConnector({ rpc: { 1: '...' } })
```

## Events

### URI_AVAILABLE

#### Example
```javascript
import { URI_AVAILABLE } from '@web3-react/walletconnect-connector'

function Component () {
  useEffect(() => {
    walletconnect.on(URI_AVAILABLE, uri => {
      // ...
    })
  })
  // ...
}
```

## Errors

### UserRejectedRequestError

#### Example
```javascript
import { UserRejectedRequestError } from '@web3-react/walletconnect-connector'

function Component () {
  const { error } = useWeb3React()
  const isUserRejectedRequestError = error instanceof UserRejectedRequestError
  // ...
}
```

Note: Once the connector has been activated, the WalletConnect provider can be accessed under the `.walletConnectProvider` property.
