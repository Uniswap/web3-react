# Custom Connectors

Building your own connector is as simple as defining a class that implements a specific interface.

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

## Communicating From Your Connector

`Connectors` can emit one of 5 events to trigger specific functionality within `web3-react`. The way to do this is to call the appropriate wrapper function in the underlying `Connector` class:

- `_web3ReactUpdateNetworkIdHandler(networkId: number, bypassCheck: boolean = false)`: update the current network ID. Passing `bypassCheck` as `true` prevents the `.getNetworkId` method of the active connector from being called.
- `_web3ReactUpdateAccountHandler(account: string, bypassCheck: boolean = false)`: update the current account. Passing `bypassCheck` as `true` prevents the `.getAccount` method of the active connector from being called.
- `_web3ReactUpdateNetworkIdAndAccountHandler(networkId: number, bypassNetworkIdCheck: boolean = false, account: string bypassAccountCheck: boolean = false)`: update the current network ID and account. Passing either `bypassCheck` as `true` prevents the `.getNetworkId` or `.getAccount` methods of the active connector from being called.
- `_web3ReactErrorHandler(error: Error)`: set an error.
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
console.log(MyConnector.errorCodes)
// { MY_ERROR_CODE: 'MY_ERROR_CODE', ... }
```
