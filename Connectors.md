# Connectors

Connectors are Javascript classes that define how your dApp will interact with the blockchain and user accounts. Connectors are _fully extensible_, meaning that if you don't like any of the default options documented below, you can implement your own! `web3-react` will work just the same. For more information, see [Connectors - Building Your Own](./Connectors - Building Your Own.md)

## Common Constructor Arguments

All constructors take at least the following three (optional) constructor arguments.

```typescript
interface ConnectorArguments {
  readonly activateAccountAutomatically?: boolean
  readonly supportedNetworks           ?: ReadonlyArray<number>
  readonly automaticPriority           ?: number
}
```

- `activateAccountAutomatically`- Controls whether an account is automatically fetched when the connector is activated.
- `supportedNetworks` - Enforces that the web3 instance is connected to a particular network. If the detected network ID is not in the passed list, the `Web3Error` screen will be shown with an error with code `UNSUPPORTED_NETWORK`. Supported network IDs are: `1` (Mainnet), `3` (Ropsten), `4` (Rinkeby), and `42` (Kovan).
- `automaticPriority` - Controls the order in which connectors will try to be automatically initialized.

## General: InjectedConnector
Manages connectivity to an injected web3 provider such as MetaMask or Trust Wallet.

```javascript
import { InjectedConnector } from 'web3-react/connectors'
```

## General: NetworkOnlyConnector
Manages connectivity to a remote web3 provider such as Infura.

```javascript
import { NetworkOnlyConnector } from 'web3-react/connectors'
```

## Specific: MetaMaskConnector
An extension of `InjectedConnector`, specifically for MetaMask.

```javascript
import { MetaMaskConnector } from 'web3-react/connectors'

const metamaskConnector = MetaMaskConnector({ ... })
```

## Specific: InfuraConnector
An extension of `NetworkOnlyConnector`, specifically for Infura. Get an [Infura API key here](https://infura.io/).

```javascript
import { InfuraConnector } from 'web3-react/connectors'

const infuraConnector = InfuraConnector({ providerURL: ..., ... })
```

## Specific: WalletConnectConnector
An extension of `NetworkOnlyConnector`, specifically for WalletConnect.

```javascript
import { WalletConnectConnector } from 'web3-react/connectors'

const walletConnectConnector = WalletConnectConnector({ bridgeURL: ..., dappName: ..., ... })
```
Note: on activation, emits a `URIAvailable` event with the URI, which must be scanned by the user for activation to be complete.
