# Connectors

Building your own connector is as simple as defining a class that implements a specific interface.

## Extending the Abstract `Connector` Class
First, define your connector class as follows.
```javascript
import { Connector } from `web3-react/connectors`

class MyConnector extends Connector {
  ...
}
```

## Constructor Arguments
The `Connector` class supports 3 generic constructor arguments:

```typescript
interface ConnectorArguments {
  readonly activateAccountAutomatically?: boolean
  readonly supportedNetworks           ?: ReadonlyArray<number>
  readonly automaticPriority           ?: number
}
```

After extracting any custom arguments which your connector may need, these generic arguments should be passed up to the `Connector` class from your constructor.

```javascript
  constructor(kwargs) {
    const { myConnectorConstructorArgument, ...rest }
    super(rest)
    ...
  }
```

## Implementing Required Functions

For ideas on how to implement these functions, see [src/connectors.ts](./src/connectors.ts).

```typescript
async getLibrary (libraryName: LibraryName): Promise<Library>
async getNetworkId (library: Library): Promise<number>
async getAccount (library: Library): Promise<string | null>
```

## Implementing Optional Functions

For ideas on how to implement these functions, see [src/connectors.ts](./src/connectors.ts).

```typescript
async onActivation (): Promise<void>
onDeactivation (): void
```

## Special Class Attributes
There are 2 class attributes that, if defined, trigger specific behavior in the manager. They are:

- `listenForNetworkChanges`: Causes the manager to listen for and react to `networkChanged` events.
- `listenForAccountChanges`: Causes the manager to listen for and react to `accountsChanged` events.

## Communicating From Your Connector
The recommended way for your connector to pass information to your UI is via events. `Connector` actually extends the [`EventEmitter` class](https://nodejs.org/docs/latest-v10.x/api/events.html#events_class_eventemitter) , which means that at any point your connector can emit events like so:

```javascript
this.emit('MyEvent', ...)
```

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
console.log(MyConnectorErrorCodes.errorCodes)
// { MY_ERROR_CODE: 'MY_ERROR_CODE', ... }
```
