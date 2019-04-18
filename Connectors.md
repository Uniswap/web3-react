# Connectors

Connectors are Javascript classes that define how your dApp will interact with the Ethereum blockchain and user accounts. Connectors are _fully extensible_, meaning that if you don't like any of the options documented below, you can implement your own! `web3-react` will work just the same. For more information, see [Custom-Connectors.md](./Custom-Connectors.md).

Note: Some Connectors throw specific errors that can be identified and handled appropriately by your dApp. In general, these error codes are available in the `.errorCodes` property of any Connector.

## `InjectedConnector`

Manages connectivity to injected web3 providers such as [MetaMask](https://metamask.io/) (or [Trust](https://trustwallet.com/)/[Tokenary](https://tokenary.io/)/etc.).

```javascript
import { Connectors } from 'web3-react'

const MetaMask = Connectors.InjectedConnector({
  supportedNetworks: [...]
})
```

Arguments:

- `supportedNetworks: number[]` (optional): Enforces that the injected connector is connected to a particular network, throwing an error if not.

Throws:

- `Connector.UNSUPPORTED_NETWORK`: Thrown if a `supportedNetworks` array is provided, and the user is not on one of those networks.

- `InjectedConnector.ETHEREUM_ACCESS_DENIED`: Thrown when a user denies permission for your dApp to access their account.

- `InjectedConnector.LEGACY_PROVIDER`: Thrown when no global `ethereum` object is available, only the deprecated `web3` object.

- `InjectedConnector.NO_WEB3`: Thrown when visiting from a non-web3 browser.

- `InjectedConnector.UNLOCK_REQUIRED`: Thrown when a user's account is locked.

## `NetworkOnlyConnector``

Manages connectivity to a remote web3 provider such as [Infura](https://infura.io/) (or [Quiknode](https://quiknode.io/)/etc.).

```javascript
import { Connectors } from 'web3-react'

const Infura = Connectors.NetworkOnlyConnector({
  providerURL: ...
})
```

Arguments:

- `providerURL` - The URL of a remote node.

Throws:

- `Connector.UNSUPPORTED_NETWORK`: Thrown if a `supportedNetworks` array is provided, and the user is not on one of those networks.

## `TrezorConnector`

### IMPORTANT: TrezorConnector is managed seperately from web3-react because it requires installing a 3rd-party SDK. See installation instructions:

```bash
yarn add @web3-react/trezor
```

Manages connectivity to a [Trezor](https://trezor.io/) device. Note: Currently, only the first account is exported/made accessible. If this limits your dApp's functionality, please [file an issue](https://github.com/NoahZinsmeister/web3-react-connectors/issues).

```javascript
import TrezorConnector from '@web3-react/trezor'

const Trezor = TrezorConnector({
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

Methods:

- `changeNetwork(networkId: number)` - Changes to a different network in `supportedNetworkURLs`.

## `LedgerConnector`

Manages connectivity to a [Ledger](https://www.ledger.com/) device. Note: Currently, only the first account is exported/made accessible. If this limits your dApp's functionality, please [file an issue](https://github.com/NoahZinsmeister/web3-react/issues).

```javascript
import { Connectors } from 'web3-react'

const Ledger = Connectors.LedgerConnector({
  supportedNetworkURLs: { ... },
  defaultNetwork: ...
})
```

Arguments:

- `supportedNetworkURLs: any` - An object whose keys are network IDs, and values are remote nodes connected to that network ID.

- `defaultNetwork: number` - The network ID that the connector will use by default.

Methods:

- `changeNetwork(networkId: number)` - Changes to a different network in `supportedNetworkURLs`.

## `WalletConnectConnector`

### IMPORTANT: WalletConnectConnector is managed seperately from web3-react because it requires installing a 3rd-party SDK. See installation instructions:

```bash
yarn add @web3-react/walletconnect
```

Manages connectivity to a [WalletConnect](https://walletconnect.org/) wallet.

```javascript
import WalletConnectConnector from '@web3-react/walletconnect'

const WalletConnect = WalletConnectConnector({
  bridge: ...,
  supportedNetworkURLs: ...,
  defaultNetwork: ...
})
```

Arguments:

- `bridge: string` - The URL of the WalletConnect bridge.

- `supportedNetworkURLs: any` - An object whose keys are network IDs, and values are remote nodes that can connect to that network ID.

- `defaultNetwork: number` - The network ID that the connector will use by default.

## `FortmaticConnector`

### IMPORTANT: FortmaticConnector is managed seperately from web3-react because it requires installing a 3rd-party SDK. See installation instructions:

```bash
yarn add @web3-react/fortmatic
```

Manages connectivity to [Fortmatic](https://fortmatic.com/).

```javascript
import FortmaticConnector from '@web3-react/fortmatic'

const Fortmatic = FortmaticConnector({
  apiKey: ...,
  logoutOnDeactivation: ...,
  testNetwork: ...
})
```

Arguments:

- `apiKey: string` - Fortmatic API key.

- `logoutOnDeactivation: boolean` - Whether to log the user out or not when the connector is unset, `false` by default.

- `testNetwork: string` (optional) - A network to initialize the Formatic SDK with.

## `PortisConnector`

### IMPORTANT: PortisConnector is managed seperately from web3-react because it requires installing a 3rd-party SDK. See installation instructions:

```bash
yarn add @web3-react/portis
```

Manages connectivity to [Portis](https://www.portis.io/).

```javascript
import PortisConnector from '@web3-react/portis'

const Portis = PortisConnector({
  dAppId: ...,
  network: ...,
  options: ...
})
```

Arguments:

- `dAppId: string` - Fortmatic API key.

- `network: any` - The network you wish to connect to.

- `options: any` (optional) - Portis SDK initialization object.

Methods:

- `changeNetwork(networkId: string)` - Changes to a different network.
