# Connectors

Connectors are Javascript classes that define how your dApp will interact with the blockchain and user accounts. Connectors are _fully extensible_, meaning that if you don't like any of the options documented below, you can implement your own! `web3-react` will work just the same. For more information, see [Custom-Connectors.md](./Custom-Connectors.md).

## Generic Connector

Many Connectors throw specific errors that can be identified and handled appropriately by your dApp. In general, these error codes are available in the `.errorCodes` property of any Connector.

### `MetaMaskConnector`

Manages connectivity to [MetaMask](https://metamask.io/).

```javascript
import { Connectors } from 'web3-react'

const metaMaskConnector = Connectors.MetaMaskConnector({ supportedNetworks: ... })
```

Arguments:

- `supportedNetworks: number[]` (optional): Enforces that MetaMask is connected to a particular network, throwing an error if not.

Throws:

- `Connector.UNSUPPORTED_NETWORK`: Thrown if an `supportedNetworks` array is provided, and the user is not on one of those networks.
- `MetaMaskConnector.ETHEREUM_ACCESS_DENIED`: Thrown when a user denies permission for your dApp to access their account.
- `MetaMaskConnector.LEGACY_PROVIDER`: Thrown when no global `ethereum` object is available, only the deprecated `web3` object.
- `MetaMaskConnector.NO_WEB3`: Thrown when visiting from a non-web3 browser.
- `MetaMaskConnector.UNLOCK_REQUIRED`: Thrown when a user's account is locked.

### `WalletConnectConnector`

Manages connectivity to a [WalletConnect](https://walletconnect.org/) wallet.

```javascript
import { Connectors } from 'web3-react'

const walletConnectConnector = Connectors.WalletConnectConnector({
  bridge: ..., supportedNetworkURLs: ..., defaultNetwork: ...
})
```

Arguments:

- `bridge: string` - The URL of the WalletConnect bridge.
- `supportedNetworkURLs: any` - An object whose keys are network IDs, and values are remote nodes that can connect to that network ID.
- `defaultNetwork: number` - The network ID to use as the default provider. Must be a member of `supportedNetworkURLs`.

The URI is exposed as `walletConnectConnector.uri`.

Throws:

- `Connector.UNSUPPORTED_NETWORK`: Thrown if the user's wallet is one a network not in the keys of `supportedNetworkURLs`.

### `NetworkOnlyConnector``

Manages connectivity to a remote web3 provider such as [Infura](https://infura.io/).

```javascript
import { Connectors } from 'web3-react'

const infuraConnector = Connectors.NetworkOnlyConnector({ providerURL: ... })
```

Arguments:

- `providerURL` - The URL of a remote node.
