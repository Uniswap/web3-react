# Connectors

Connectors are Javascript classes that define how your dApp will interact with the blockchain and user accounts. Connectors are _fully extensible_, meaning that if you don't like any of the options documented below, you can implement your own! `web3-react` will work just the same. For more information, see [Custom-Connectors.md](./Custom-Connectors.md)

- `automaticPriority` - Controls the order in which connectors will try to be automatically initialized.

### `MetaMaskConnector`

Manages connectivity to [MetaMask](https://metamask.io/).

```javascript
import { MetaMaskConnector } from 'web3-react/connectors'

const metamaskConnector = MetaMaskConnector({ supportedNetworks: ... })
```

Optional Arguments:

- `supportedNetworks` - Enforces that MetaMask is connected to a particular network. Supported network IDs are: `1` (Mainnet), `3` (Ropsten), `4` (Rinkeby), `5` (Görli) and `42` (Kovan).

### `NetworkOnlyConnector``

Manages connectivity to a remote web3 provider such as [Infura](https://infura.io/).

```javascript
import { NetworkOnlyConnector } from 'web3-react/connectors'

const infuraConnector = InfuraConnector({ providerURL: ... })
```

Required Arguments:

- `providerURL` - The URL of a remote node.

### `WalletConnectConnector`

Manages connectivity to a [WalletConnect](https://docs.walletconnect.org/) wallet.

```javascript
import { WalletConnectConnector } from 'web3-react/connectors'

const walletConnectConnector = WalletConnectConnector({
  bridge: ..., supportedNetworkURLs: ..., defaultNetwork: ...
})
```

Required Arguments:

- `bridge` - The URL of the WalletConnect bridge.
- `supportedNetworkURLs` - An object mapping network IDs to remote nodes.
- `defaultNetwork` - The network ID (as a number) to use as the default provider. Must be a member of `supportedNetworkURLs`.

The URI is exposed as `walletConnectConnector.uri`.
