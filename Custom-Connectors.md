# Custom Connectors

Building your own connector is as simple as defining a class that implements a specific interface!

## Extending the Abstract `Connector` Class

First, define your connector class:

```javascript
import { Connectors } from `web3-react`
const { Connector } = Connectors

class MyConnector extends Connector {
  ...
}
```

## Implement Required Functions

For ideas on how to implement required functions, see [src/connectors/](./src/connectors/).

```typescript
async getProvider(networkId?: number): Promise<Provider>
```

## Implement Optional Functions

For ideas on how to implement optional functions, or for default behavior, see [src/connectors/](./src/connectors/).

```typescript
async onActivation(): Promise<void>
onDeactivation(): void

async getNetworkId(provider: Provider): Promise<number>
async getAccount(provider: Provider): Promise<string | null>
```

## Using `@0x/subproviders` / `web3-provider-engine`

It's likely that if you're writing a custom connector, you'll want to use the convenience classes exported by [`@0x/subproviders`](https://github.com/0xProject/0x-monorepo/tree/development/packages/subproviders) (which in turn relies on [web3-provider-engine](https://github.com/MetaMask/web3-provider-engine)), as most of the default connectors do. To facilitate this, all exports of `@0x/subproviders` are provided under the named `subproviders` export of this package.

```javascript
import { subproviders } from 'web3-react'
```

## Communicating From Your Connector

`Connectors` can emit one of 3 events to trigger specific functionality within `web3-react`. The way to do this is to call the appropriate wrapper function in the underlying `Connector` class:

- `_web3ReactUpdateHandler({ updateNetworkId?: boolean, updateAccount?: boolean, overrideNetworkIdCheck?: boolean, overrideAccountCheck?: boolean, networkId?: number, account?: string})`: update the current network ID and/or account. One/Both of `updateNetworkId`/`updateAccount` must be passed. `networkId`/`account` are optional arguments that indicate the new network id account (if not passed, these values are fetched using `.getNetworkId`/`.getAccount`). `overrideNetworkIdCheck`/`overrideAccountCheck` control whether, if `networkId`/`account` are passed, whether to override calling the `.getNetworkId`/`.getAccount` methods of the active connector.
- `_web3ReactErrorHandler(error: Error, clearConnector?: boolean)`: set an error, optionally clearing the current active connector.
- `_web3ReactResetHandler()`: unset the connector.

## Using `ErrorCodeMixin`

If your connector emits custom error codes that you want to recognize and deal with in specific ways within your dApp, your connector should be defined as follows:

```javascript
import { Connectors } from `web3-react`
const { Connector, ErrorCodeMixin } = Connectors

const MyConnectorErrorCodes = ['MY_ERROR_CODE', ...]

class MyConnector extends ErrorCodeMixin(Connector, MyConnectorErrorCodes) {
  ...
}
```

This ensures that a static `.errorCodes` property will exist on your connector, which will contain an object with keys and values equal to the passed error code strings.

```javascript
console.log(MyConnector.errorCodes) // { MY_ERROR_CODE: 'MY_ERROR_CODE', ... }
```
