# `web3-react` Documentation

- [Overview](#overview)
- [Install](#install)
- [web3-react@core API Reference](#web3-reactcore-api-reference)
  - [Web3ReactProvider](#web3reactprovider)
    - [Props](#props)
    - [Example](#example)
  - [useWeb3React](#useweb3react)
    - [Arguments](#arguments)
    - [Example](#example-1)
  - [createWeb3ReactRoot](#createweb3reactroot)
    - [Arguments](#arguments-1)
    - [Example](#example-2)
  - [getWeb3ReactContext](#getweb3reactcontext)
    - [Arguments](#arguments-2)
    - [Example](#example-3)
  - [UnsupportedChainIdError](#unsupportedchainiderror)
    - [Example](#example-4)
- [Understanding Error Bubbling](#understanding-error-bubbling)

## Overview
At a high level, `web3-react` is a state machine which ensures that certain key pieces of data (the user's current account, for example) relevant to your dApp are kept up-to-date. To this end, `web3-react` uses [Context](https://reactjs.org/docs/context.html) to efficiently store this data, and inject it wherever you need it in your application.

The data conforms to the following interface:

```typescript
interface Web3ReactContextInterface<T = any> {
  activate: (
    connector: AbstractConnectorInterface,
    onError?: (error: Error) => void,
    throwErrors?: boolean
  ) => Promise<void>
  setError: (error: Error) => void
  deactivate: () => void

  connector?: AbstractConnectorInterface
  library?: T
  chainId?: number
  account?: null | string

  active: boolean
  error?: Error
}
```

The documentation that follows is for `@web3-react/core`, the package responsible for managing this context. To understand where the data itself comes from, head over to the [connectors/ folder](./connectors/).

## Install
- Grab a fresh copy of `react@>=16.8`...\
  `yarn add react`

- ...and then install `web3-react`\
  `yarn add @web3-react/core`

## `web3-react@core` API Reference

### Web3ReactProvider
`web3-react` relies on the existence of a `Web3ReactProvider` at the root of your application (or more accurately, at the root of the subtree which you'd like to have web3 functionality). It requires a single `getLibrary` prop which is responsible for instantiating a web3 convenience library object from a low-level provider.

#### Props
```typescript
getLibrary: (provider?: any, connector?: AbstractConnectorInterface) => any
```

#### Example
```javascript
import { Web3ReactProvider } from '@web3-react/core'
// import your favorite web3 convenience library here

function getLibrary(provider, connector) {
  return new Web3Provider(provider) // this will vary according to whether you use e.g. ethers or web3.js
}

function App () {
  return (
    <Web3ReactProvider getLibrary={getLibrary}>
      {/* <...> */}
    </Web3ReactProvider>
  )
}
```

### useWeb3React
If you're using Hooks (😇), useWeb3React will be your best friend. Call it from within any function component to access context variables, just like that. It accepts an optional `key` argument, if you're using [multiple roots](#createweb3reactroot).

#### Arguments
```typescript
key?: string
```

#### Example
```javascript
import { useWeb3React } from '@web3-react/core'

function Component () {
  const web3React = useWeb3React()
  // ...
}
```

### createWeb3ReactRoot
In some cases, your dApp may want to maintain >1 active web3 connections simultaneously. This could be for any number of reasons, including:

- Wanting "always-on" access to a remote node, while letting users bring their own accounts as necessary
- Communicating with a sidechain and mainnet in tandem
- Balancing an in-browser burner wallet with other connection methods

In cases like these, you'll likely want to create a second (or maybe even third, but probably not fourth) root, which will function exactly like another [Web3ReactProvider](#web3reactprovider) (in fact, Web3ReactProvider uses createWeb3ReactRoot under the hood). It requires a `key` argument, used to identify the root to [useWeb3React](#useweb3react) (or [getWeb3ReactContext](#getweb3reactcontext)).

#### Arguments
```typescript
key: string
```

#### Example
```javascript
import { Web3ReactProvider, createWeb3ReactRoot } from '@web3-react/core'
// import your favorite web3 convenience library here

function getLibrary(provider) {
  return new Web3Provider(provider) // this will vary according to whether you use e.g. ethers or web3.js
}

const Web3ReactProviderReloaded = createWeb3ReactRoot('anotherOne')

function App () {
  return (
    <Web3ReactProvider getLibrary={getLibrary}>
      <Web3ReactProviderReloaded getLibrary={getLibrary}>
        {/* <...> */}
      </Web3ReactProviderReloaded>
    </Web3ReactProvider>
  )
}
```

### getWeb3ReactContext
If you're not using Hooks (😳), getWeb3ReactContext is your savior. It gives direct access to the context returned by [createContext](https://reactjs.org/docs/context.html#reactcreatecontext), which will unlock the use of [contextType](https://reactjs.org/docs/context.html#classcontexttype) in class components, the [Context.Consumer](https://reactjs.org/docs/context.html#contextconsumer) pattern, or whatever other render prop/HOC/etc. shenanigans your manager whose personal site still runs on PHP is making you write. It accepts an optional `key` argument to identify the root.

#### Arguments
```typescript
key?: string
```

#### Example
```javascript
import { getWeb3ReactContext } from '@web3-react/core'

const web3ReactContext = getWeb3ReactContext()

// ...
```

### UnsupportedChainIdError
This is an error which can be used to inform users that they're connected to an unsupported network.

#### Example
```javascript
import { UnsupportedChainIdError } from '@web3-react/core'
// ...

function Component () {
  const { error } = useWeb3React()
  const isUnsupportedChainIdError = error instanceof UnsupportedChainIdError
  // ...
}å
```

## Understanding Error Bubbling
Errors that occur during the initial activation of a connector (i.e. inside activate), are are handled in 1 of 4 ways:

1) In the case where there's been 1 or more other updates to the `web3-react` context between when activate was called and when it resolved with the data required to complete the activation, errors are silently suppressed (in development mode, a warning will be logged to the console). This should really only happen in cases where activation takes a very long time and the user does something in the intervening time, such as activating another connector, deactivating the current connector, etc.
2) If `throwErrors` (the third argument to activate) is passed, errors will be thrown and should be handled in a .catch. No updates to the `web3-react` context will occur.
3) If `onError` (the second argument to activate) is passed, that function is called with the error. No updates to the `web3-react` context will occur.
4) Otherwise, the error will be set in the `web3-react` context (along with the connector).

Errors that occur while a connector is set are handled in 1 of 2 ways:

1) If an `onError` function was passed, this function is called with the error. No updates to the `web3-react` context will occur.
2) Otherwise, the error will be set in the `web3-react` context.

In all of these scenarios, note that calling setError will update the `web3-react` context. This can be called any time a connector is set, and it can be useful for e.g. manually triggering your app's handling of the `web3-react` error property.

Note: if an error is ever set in the `web3-react` context, and a connector triggers an update, the manager will attempt to revalidate all properties as if activate was called again, to recover from the error state.
