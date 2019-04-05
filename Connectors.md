# Connectors

Connectors are Javascript classes that define how your dApp will interact with the blockchain and user accounts. Connectors are _fully extensible_, meaning that if you don't like any of the options documented below, you can implement your own! `web3-react` will work just the same. For more information, see [Custom-Connectors.md](./Custom-Connectors.md).

Note: Some Connectors throw specific errors that can be identified and handled appropriately by your dApp. In general, these error codes are available in the `.errorCodes` property of any Connector.

### `MetaMaskConnector`

Manages connectivity to [MetaMask](https://metamask.io/).

```javascript
import { Connectors } from 'web3-react'

const metaMaskConnector = Connectors.MetaMaskConnector({
  supportedNetworks: [...]
})
```

Arguments:

- `supportedNetworks: number[]` (optional): Enforces that MetaMask is connected to a particular network, throwing an error if not.

Throws:

- `Connector.UNSUPPORTED_NETWORK`: Thrown if a `supportedNetworks` array is provided, and the user is not on one of those networks.
- `MetaMaskConnector.ETHEREUM_ACCESS_DENIED`: Thrown when a user denies permission for your dApp to access their account.
- `MetaMaskConnector.LEGACY_PROVIDER`: Thrown when no global `ethereum` object is available, only the deprecated `web3` object.
- `MetaMaskConnector.NO_WEB3`: Thrown when visiting from a non-web3 browser.
- `MetaMaskConnector.UNLOCK_REQUIRED`: Thrown when a user's account is locked.

### `NetworkOnlyConnector``

Manages connectivity to a remote web3 provider such as [Infura](https://infura.io/).

```javascript
import { Connectors } from 'web3-react'

const infuraConnector = Connectors.NetworkOnlyConnector({
  providerURL: ...,
  supportedNetworks: [...]
})
```

Arguments:

- `providerURL` - The URL of a remote node.
- `supportedNetworks: number[]` (optional): Enforces that the provider is connected to a particular network, throwing an error if not.

Throws:

- `Connector.UNSUPPORTED_NETWORK`: Thrown if a `supportedNetworks` array is provided, and the user is not on one of those networks.

### `TrezorConnector` _EXPERIMENTAL_

Manages connectivity to a [Trezor](https://trezor.io/) device.

```javascript
import { Connectors } from 'web3-react'

const trezorConnector = Connectors.TrezorConnector({
  supportedNetworkURLs: { ... },
  defaultNetwork: ...,
  manifestEmail: ...,
  manifestAppUrl: ...
})
```

Arguments:

- `supportedNetworkURLs: any` - An object whose keys are network IDs, and values are remote nodes connected to that network ID.
- `defaultNetwork: number` - The network ID that the connector will use by default.
- `manifestEmail: string` - [Manifest email](https://github.com/trezor/connect/blob/develop/docs/index.md)
- `manifestAppUrl: string` - [Manifest email](https://github.com/trezor/connect/blob/develop/docs/index.md)

### `LedgerConnector` _EXPERIMENTAL_

Manages connectivity to a [Ledger](https://www.ledger.com/) device.

```javascript
import { Connectors } from 'web3-react'

const ledgerConnector = Connectors.LedgerConnector({
  supportedNetworkURLs: { ... },
  defaultNetwork: ...
})
```

Arguments:

- `supportedNetworkURLs: any` - An object whose keys are network IDs, and values are remote nodes connected to that network ID.
- `defaultNetwork: number` - The network ID that the connector will use by default.

### `FortmaticConnector` _EXPERIMENTAL_

Manages connectivity to [Fortmatic](https://fortmatic.com/).

```javascript
import { Connectors } from 'web3-react'

const fortmaticConnector = Connectors.FortmaticConnector({
  apiKey: ...,
  logoutOnDeactivation: ...
})
```

Arguments:

- `apiKey: string` - Fortmatic API key.
- `logoutOnDeactivation: boolean` - Whether to log the user out or not when the connector is unset, `false` by default.

### `WalletConnectConnector` _EXPERIMENTAL_

Manages connectivity to a [WalletConnect](https://walletconnect.org/) wallet.

```javascript
import { Connectors } from 'web3-react'

const walletConnectConnector = Connectors.WalletConnectConnector({
  bridge: ...,
  supportedNetworkURLs: ...,
  defaultNetwork: ...
})
```

Arguments:

- `bridge: string` - The URL of the WalletConnect bridge.
- `supportedNetworkURLs: any` - An object whose keys are network IDs, and values are remote nodes that can connect to that network ID.
- `defaultNetwork: number` - The network ID that the connector will use by default.
