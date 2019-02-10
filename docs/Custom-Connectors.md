# Connectors

Building your own connector is as simple as defining a class that implements a specific interface.

## Extending the Abstract `Connector` Class

First, define your connector class:

```javascript
import { Connector } from `web3-react/connectors`

class MyConnector extends Connector {
  ...
}
```

## Implementing Required Functions

For ideas on how to implement these functions, see [src/connectors.ts](./src/connectors.ts).

```typescript
async getLibrary(libraryName: LibraryName, networkId?: number): Promise<Library>
async getNetworkId(library: Library): Promise<number>
async getAccount(library: Library): Promise<string | null>
```

## Implementing Optional Functions

For ideas on how to implement these functions, see [src/connectors.ts](./src/connectors.ts).

```typescript
async onActivation(): Promise<void>
onDeactivation(): void
```

## Communicating From Your Connector

`Connectors` can emit one of 5 events to trigger specific functionality within `web3-react`. The way to do this is to call the appropriate wrapper function in the unerlying `Connector` class:

- `_web3ReactUpdateNetworkIdHandler(networkId: number)`: update the current network Id.
- `_web3ReactUpdateAccountHandler(account: string)`: update the current account.
- `_web3ReactUpdateNetworkIdAndAccountHandler(networkId: number, account: string)`: update the current network Id and account.
- `_web3ReactErrorHandler(error: Error)`: set an error.
- `_web3ReactResetHandler()`: unset the connector.

## Using `ErrorCodeMixin`

If your connector emits custom error codes that you want to recognize and deal with in specific ways within your connector/dApp, your connector should be defined as follows:

```javascript
import { Connector, ErrorCodeMixin } from `web3-react/connectors`

const MyConnectorErrorCodes = ['MY_ERROR_CODE', ...]

class MyConnector extends ErrorCodeMixin(Connector, MyConnectorErrorCodes) {
  ...
}
```

This ensures that a static `errorCodes` property will exist on your connector, which will contain an object with keys and values equal to the passed error code strings.

```javascript
console.log(MyConnector.errorCodes)
// { MY_ERROR_CODE: 'MY_ERROR_CODE', ... }
```
