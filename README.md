[![npm version](https://img.shields.io/npm/v/web3-react/unstable.svg)](https://www.npmjs.com/package/web3-react/v/unstable)
[![Build Status](https://travis-ci.org/NoahZinsmeister/web3-react.svg?branch=master)](https://travis-ci.org/NoahZinsmeister/web3-react)
[![Coverage Status](https://coveralls.io/repos/github/NoahZinsmeister/web3-react/badge.svg?branch=unstable)](https://coveralls.io/github/NoahZinsmeister/web3-react?branch=unstable)

![Example GIF](./_assets/example.gif)

## Resources

- Documentation for `web3-react` is [available on Gitbook](https://noahzinsmeister.gitbook.io/web3-react/v/unstable/).

- A live demo of `web3-react` is [available on CodeSandbox](https://codesandbox.io/s/w68nr06x77).

## Introduction

`web3-react` is a drop in solution for building Ethereum dApps in React. Its marquee features are:

- A large and fully extensible collection of Connectors, which manage connectivity with the Ethereum blockchain and user account(s). Connectors can make your dApp compatible with [MetaMask](https://metamask.io/), [WalletConnect](https://walletconnect.org/), [Infura](https://infura.io/), [Trust](https://trustwalletapp.com/), and more.

- A robust web3 management framework which exposes the current account, the current network ID, and an instantiated [ethers.js](https://github.com/ethers-io/ethers.js/) or [web3.js](https://web3js.readthedocs.io/en/1.0/) instance to your dapp via a [React Context](https://reactjs.org/docs/context.html).

- A collection of [React Hooks](https://reactjs.org/docs/hooks-intro.html) that can be used to display ETH and ERC-20 balances, sign messages, send transactions, etc.

- A number of utility functions to format [Etherscan](https://etherscan.io/) links, convert token balances, etc.

## Implementations

Projects using `web3-react` include:

- https://github.com/NoahHydro/snowflake-dashboard
- https://conlan.github.io/compound-liquidator/
- https://uniswap.info

Open a PR to add your project to the list! If you're interested in contributing, check out [Contributing-Guidelines.md](./docs/Contributing-Guidelines.md).

## Quickstart

If you want to cut straight to the chase, check out the CodeSandbox demo!

[![Edit web3-react-demo](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/w68nr06x77)

### 1. Install

Ensure you have an up-to-date `react` and `react-dom` version:

```bash
yarn add react@latest react-dom@latest
```

Then, get the npm package:

```bash
yarn add web3-react@unstable
```

### 2. Setup Connectors

Now, decide how you want users to interact with your dApp. For the vast majority of dApps, this will be with some combination of MetaMask/Infura/WalletConnect. For more details see [Connectors.md](./docs/Connectors.md).

```javascript
import { MetaMaskConnector, InfuraConnector, WalletConnectConnector } from 'web3-react/connectors'

const connectors = {
  metamask: new MetaMaskConnector(),
  infura: new InfuraConnector({ providerURL: 'https://mainnet.infura.io/v3/<YOUR-API-KEY>' }),
  walletConnect: new WalletConnectConnector({
    bridge: 'https://bridge.walletconnect.org',
    supportedNetworkURLs: { 1: 'https://mainnet.infura.io/v3/<YOUR-API-KEY>' },
    defaultNetwork: 1
  })
}
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

`Web3Provider` takes 4 props:

1. `connectors` (required): An object mapping connector names to Connectors (see the previous section).

2. `libraryName` (optional): `web3.js` or `ethers.js`, depending on which library you wish to use in your dApp.

3. `reRendererNames` (optional) strings which with you wish to control specific re-renders of data after, e.g. a transaction confirmation.

4. `children` (required): The rest of your dApp.

### 4. Using `web3-react`

Finally, you're ready to use `web3-react`!

#### _Recommended_ - Hooks

The easiest way to use `web3-react` is with Hooks.

```javascript
import React from 'react'
import { useWeb3Context } from 'web3-react/hooks'

function MyComponent() {
  const context = useWeb3Context()

  return <p>{context.account}</p>
}
```

For more details see [Hooks.md](./docs/Hooks.md).

#### _Conditionally Recommended_ - Render Props

To use `web3-react` with render props, wrap Components in a `Web3Consumer`. It takes two props:

1. `recreateOnNetworkChange` (optional, default `true`). A flag that controls whether child components are freshly re-initialized upon network changes.

1. `recreateOnAccountChange` (optional, default `true`). A flag that controls whether child components are freshly re-initialized upon account changes.

Note: Re-initialization is often the desired behavior, though properly written Hooks may not require these flags to be set.

```javascript
import React from 'react'
import { Web3Consumer } from 'web3-react'

function AccountComponent({ account }) {
  return <p>{account}</p>
}

function MyComponent() {
  return <Web3Consumer>{context => <AccountComponent account={context.account} />}</Web3Consumer>
}
```

Note: This pattern will work for arbitrarily deeply nested components. This means that the `Web3Consumer` doesn't necessarily need to be at the top level of your app. There also won't be performance concerns if you choose to use multiple `Web3Consumer`s at different nesting levels.

#### _Not Recommended_ - HOCs

If you must, you use `web3-react` with an [HOC](https://reactjs.org/docs/context.html#consuming-context-with-a-hoc). The `withWeb3` wrapper's second argument can optionally be the recreate flags from the render props pattern.

```javascript
import React from 'react'
import { withWeb3 } from 'web3-react'

function MyComponent({ web3 }) {
  const { account } = web3
  return <p>{account}</p>
}

export default withWeb3(MyComponent)
```

Note: The high-level component which includes your `Web3Provider` Component **cannot** be wrapped with `withWeb3`.

## Context

Regardless of how you inject the context, it looks like:

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

  reRenderers: IReRendererState
  forceReRender: Function
}
```

### Variables

- `active`: A flag for whether `web3-react` has been initialized.
- `connectorName`: The name of the currently active connector
- `library`: A [web3.js](https://web3js.readthedocs.io/en/1.0/) or [ethers.js](https://github.com/ethers-io/ethers.js/) instance instantiated with the current web3 provider.
- `networkId`: The current active network ID.
- `account`: The current active account.
- `error`: A global error if one exists.

### Manager Functions

- `setConnector(connectorName)`: Activates a connector.
- `setFirstValidConnector(connectorName)`: Tries to activate each connector in turn.
- `unsetConnector()`: Resets the currently active connector.

### Renderers

These variables/functions facilitate the re-rendering of specific data. For example, a user's balance can change over time.

```javascript
import { useEffect } from 'react'
import { useWeb3Context } from 'web3-react/hooks'

const reRendererNames = ['MyReRenderer']
// assume this array was passed to the Web3Provider...

function MyComponent() {
  const context = useWeb3Context()

  useEffect(() => {
    // run code here that should run again when calling context.forceReRender('MyReRenderer')
  }, [context.reRenderers.MyReRenderer])

  ...
}
```

- `reRenderers`: An object, where the keys are the `reRendererNames` passed into the `Web3Provider` and the values force re-renders of specific data when included in `useEffect` hook updaters.
- `forceReRender(reRendererName)`: A function that triggers a global re-render of the `reRendererName`.

## Utility Functions

Documentation for the utility functions exported by `web3-react` can be found in [Utilities.md](./docs/Utilities.md).

## Hooks

Documentation for the hooks exported by `web3-react` can be found in [Hooks.md](./docs/Hooks.md).

## Notes

Prior art for `web3-react` includes:

- A pure Javascript implementation with some of the same goals: [web3-webpacked](https://github.com/NoahZinsmeister/web3-webpacked).

- A non-Hooks port of [web3-webpacked](https://github.com/NoahZinsmeister/web3-webpacked) to React that had some problems:
  [web3-webpacked-react](https://github.com/NoahZinsmeister/web3-webpacked-react).

- A React library with some of the same goals but that uses the deprecated React Context API and not Hooks: [react-web3](https://github.com/coopermaruyama/react-web3).
