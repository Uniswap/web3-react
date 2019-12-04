# `web3-react` Documentation

- [Install](#install)
- [`web3-react` Context](#web3-react-context)
- [`web3-react@core` API Reference](#web3-reactcore-api-reference)
  - [Web3ReactProvider](#web3reactprovider)
    - [Props](#props)
    - [Example](#example)
  - [createWeb3ReactRoot](#createweb3reactroot)
    - [Arguments](#arguments)
    - [Example](#example-1)
  - [useWeb3React](#useweb3react)
    - [Arguments](#arguments-1)
    - [Example](#example-2)
  - [getWeb3ReactContext](#getweb3reactcontext)
    - [Arguments](#arguments-2)
    - [Example](#example-3)
  - [UnsupportedChainIdError](#unsupportedchainiderror)
    - [Example](#example-4)

## Install
- Grab yourself a fresh copy of `react@>=16.8`\
  `yarn add react@latest`

- And then install `web3-react`\
  `yarn add @web3-react/core@latest`

## `web3-react` Context

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

## `web3-react@core` API Reference

### Web3ReactProvider
`web3-react` relies on the existence of a `Web3ReactProvider` at the root of your dApp (or the subtree which you'd like to have web3 functionality).

#### Props
```typescript
getLibrary: (provider: any) => any
```

#### Example
```javascript
import { Web3ReactProvider } from '@web3-react/core'
// ...

function getLibrary(provider) {
  return new Web3Provider(provider) // this will vary acccording to the web3 convenience library you use
}

function App () {
  return (
    <Web3ReactProvider getLibrary={getLibrary}>
      {/* <...> */}
    </Web3ReactProvider>
  )
}
```

### createWeb3ReactRoot
In some cases, a dApp may want to maintain >1 active web3 connections simultaneously. This could be for any number of reasons, including:

- Wanting "always-on" access to a remote node, while letting users bring their own accounts as necessary
- Communicating with a sidechain and mainnet in tandem
- Balancing an in-browser burner wallet with other connection methods

In cases like these, you'll likely want to create a second (or maybe even third third, but probably not fourth) root, which will function exactly like another [Web3ReactProvider](#web3reactprovider) (in fact, Web3ReactProvider uses createWeb3ReactRoot under the hood).

#### Arguments
```typescript
key: string
```

#### Example
```javascript
import { Web3ReactProvider, createWeb3ReactRoot } from '@web3-react/core'
// ...

function getLibrary(provider) {
  return new Web3Provider(provider) // this will vary acccording to the web3 convenience library used
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

### useWeb3React
If you're using Hooks (😇), useWeb3React is your best friend. Call it from within any function component to access the [`web3-react` Context](#web3-react-context). Just like that.

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

### getWeb3ReactContext
If you're not using Hooks (😳), getWeb3ReactContext is your savior. It will give you direct access to the context returned by [`createContext`](https://reactjs.org/docs/context.html#reactcreatecontext), which will unlock the use of [`contextType`](https://reactjs.org/docs/context.html#classcontexttype) in class components, the [`Context.Consumer`](https://reactjs.org/docs/context.html#contextconsumer) pattern, or whatever other render prop/HOC/etc. shenanigans your manager whose personal site still runs on PHP is making you write.

#### Arguments
```typescript
key?: string
```

#### Example
```javascript
import { getWeb3ReactContext } from '@web3-react/core'

const web3ReactContext = getWeb3ReactContext()
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
}
```
