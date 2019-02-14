[![npm version](https://img.shields.io/npm/v/web3-react/next.svg)](https://www.npmjs.com/package/web3-react/v/next)
[![Build Status](https://travis-ci.org/NoahZinsmeister/web3-react.svg?branch=next)](https://travis-ci.org/NoahZinsmeister/web3-react)
[![Coverage Status](https://coveralls.io/repos/github/NoahZinsmeister/web3-react/badge.svg?branch=next)](https://coveralls.io/github/NoahZinsmeister/web3-react?branch=next)

![Example GIF](./_assets/example.gif)

## Resources

- Documentation for `web3-react` is [available on Gitbook](https://noahzinsmeister.gitbook.io/web3-react/v/next/).

- A live demo of `web3-react` is [available on CodeSandbox](https://codesandbox.io/s/jpyw6qoq9).

## Introduction

`web3-react` is a drop-in solution for building Ethereum dApps in React. Its marquee features are:

- Robust support for commonly used web3 providers such as [MetaMask](https://metamask.io/), [WalletConnect](https://walletconnect.org/), [Infura](https://infura.io/), [Trust](https://trustwalletapp.com/), and more.

- A robust framework which exposes an [ethers.js](https://github.com/ethers-io/ethers.js/) or [web3.js](https://web3js.readthedocs.io/en/1.0/) instance, the current account and network id, and a variety of helper functions to your dApp via a [React Context](https://reactjs.org/docs/context.html).

- The ability to write fully featured, custom Connectors to manage every aspect of your dApps connectivity with the Ethereum blockchain and user account(s), if you need it.

## Quickstart

If you want to cut straight to the chase, check out the CodeSandbox demo!

[![Edit web3-react](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/jpyw6qoq9)

### 1. Install

Ensure you're using the latest `react` and `react-dom` versions:

```bash
yarn add react@latest react-dom@latest
```

Then, get `web3-react`:

```bash
yarn add web3-react@next
```

### 2. Setup Connectors

Now, you'll need to decide how you want users to interact with your dApp. For the vast majority of dApps, this will be with some combination of MetaMask, WalletConnect, or Infura. For more details on each of these options, see [Connectors.md](./Connectors.md).

```javascript
import { Connectors } from 'web3-react'
const { MetaMaskConnector, WalletConnectConnector, NetworkOnlyConnector } = Connectors

const metaMask = new MetaMaskConnector({ supportedNetworks: 1 })

const walletConnect = new WalletConnectConnector({
  bridge: 'https://bridge.walletconnect.org',
  supportedNetworkURLs: { 1: 'https://mainnet.infura.io/v3/...' },
  defaultNetwork: 1
})

const infura = new NetworkOnlyConnector({
  providerURL: 'https://mainnet.infura.io/v3/...'
})

const connectors = { metaMask, walletConnect, infura }
```

### 3. Setup `Web3Provider`

The next step is to setup a `Web3Provider` at the root of your dApp. This ensures that children components are able to take advantage of the `web3-react` context variables.

```javascript
import React from 'react'
import Web3Provider from 'web3-react'

export default function App () {
  return (
    <Web3Provider
      connectors={...}
      libraryName={...}
      reRendererNames={...}
    >
      ...
    </Web3Provider>
  )
}
```

The `Web3Provider` takes 3 props:

1. `connectors: any` (required): An object mapping arbitrary `string` connector names to Connector classes (see [the previous section](#2-setup-connectors) for more detail).

2. `libraryName: string` (optional): `web3.js` or `ethers.js`, depending on which library you wish to use in your dApp.

3. `reRendererNames: string[]` (optional): An array of arbitrary `string` names which can be used to control targeted global data re-rendering. For more information, see [the section on re-renderers](#re-renderers).

### 4. Using `web3-react`

Finally, you're ready to use `web3-react`!

#### _Recommended_ - Hooks

The easiest way to use `web3-react` is with the `useWeb3Context` hook.

```javascript
import React from 'react'
import { useWeb3Context } from 'web3-react'

function MyComponent() {
  const context = useWeb3Context()

  return <p>{context.account}</p>
}
```

Note: The Component which includes your `Web3Provider` Component **cannot** use `useWeb3Context`.

#### _Conditionally Recommended_ - Render Props

To use `web3-react` with render props, wrap Components in a `Web3Consumer`.

```javascript
import React from 'react'
import { Web3Consumer } from 'web3-react'

function MyComponent() {
  return <Web3Consumer>{context => <p>{account}</p>}</Web3Consumer>
}
```

The component takes 2 props:

1. `recreateOnNetworkChange: boolean` (optional, default `true`). A flag that controls whether child components are completely re-initialized upon network changes.

2. `recreateOnAccountChange: boolean` (optional, default `true`). A flag that controls whether child components are completely re-initialized upon account changes.

Note: This pattern will work for arbitrarily deeply nested components. This means that the `Web3Consumer` doesn't necessarily need to be at the top level of your app. There also won't be performance concerns if you choose to use multiple `Web3Consumer`s at different nesting levels.

#### _Not Recommended_ - HOCs

If you must, you use `web3-react` with an [HOC](https://reactjs.org/docs/context.html#consuming-context-with-a-hoc).

```javascript
import React from 'react'
import { withWeb3 } from 'web3-react'

function MyComponent({ web3 }) {
  const { account } = web3
  return <p>{account}</p>
}

export default withWeb3(MyComponent)
```

`withWeb3` takes an optional second argument, an object that can set the flags defined above in the [render props section](conditionally-recommended---render-props).

Note: The Component which includes your `Web3Provider` Component **cannot** be wrapped with `withWeb3`.

## Context

Regardless of how you access the `web3-react` context, it will look like:

```typescript
{
  active: boolean
  connectorName?: string
  library?: Library
  networkId?: number
  account?: string | null
  error: Error | null

  setConnector: Function
  setFirstValidConnector: Function
  unsetConnector: Function
  setError: Function

  reRenderers: IReRendererState
  forceReRender: Function
}
```

### Variables

- `active`: A flag indicating whether `web3-react` has been initialized.
- `connectorName`: The name of the currently active connector.
- `library`: An [ethers.js](https://github.com/ethers-io/ethers.js/) or [web3.js](https://web3js.readthedocs.io/en/1.0/) instance, instantiated with the current web3 provider.
- `networkId`: The current active network ID.
- `account`: The current active account if one exists.
- `error`: The current active error if one exists.

### Manager Functions

- `setConnector(connectorName: string)`: Activates a connector.
- `setFirstValidConnector(connectorNames: string[])`: Tries to activate each connector in turn.
- `unsetConnector()`: Unsets the currently active connector.
- `setError()`: Sets an error.

### Re-Renderers

- `reRenderers`: An object, where the keys are the `reRendererNames` passed into the `Web3Provider` and the values can be used to force re-renders of specific data, e.g. when included in the `useEffect` hook dependencies array.
- `forceReRender(reRendererName)`: A function that triggers a global re-render for the `reRendererName`.

It's possible that a dApp may wish to re-calculate certain values after certain events, perhaps without monitoring the chain to do so. One flavor of this imperative updating is updating an account balance after every transaction. To achieve such a patter,

```javascript
import { useEffect } from 'react'
import { useWeb3Context } from 'web3-react/hooks'

const reRendererNames = ['MyReRenderer'] // assume this array was passed to the Web3Provider...

function MyComponent() {
  const context = useWeb3Context()

  useEffect(() => {
    // code here will run again every time context.forceReRender('MyReRenderer') is called
  }, [context.reRenderers.MyReRenderer])

  ...
}
```

## Implementations

Projects using `web3-react` include:

- https://hydroblockchain.github.io/snowflake-dashboard/
- https://conlan.github.io/compound-liquidator/
- https://uniswap.info

Open a PR to add your project to the list! If you're interested in contributing, check out [Contributing-Guidelines.md](./docs/Contributing-Guidelines.md).

## Notes

Prior art for `web3-react` includes:

- A pure Javascript implementation with some of the same goals: [web3-webpacked](https://github.com/NoahZinsmeister/web3-webpacked).

- A non-Hooks port of [web3-webpacked](https://github.com/NoahZinsmeister/web3-webpacked) to React that had some problems: [web3-webpacked-react](https://github.com/NoahZinsmeister/web3-webpacked-react).

- A React library with some of the same goals but that uses the deprecated React Context API and does not use hooks: [react-web3](https://github.com/coopermaruyama/react-web3).
