# `web3-react`

[![npm version](https://badge.fury.io/js/web3-react.svg)](https://www.npmjs.com/package/web3-react)
[![npm downloads](https://img.shields.io/npm/dm/web3-react.svg)](https://www.npmjs.com/package/web3-react)
[![Build Status](https://travis-ci.org/NoahZinsmeister/web3-react.svg?branch=master)](https://travis-ci.org/NoahZinsmeister/web3-react)
[![Coverage Status](https://coveralls.io/repos/github/NoahZinsmeister/web3-react/badge.svg?branch=master)](https://coveralls.io/github/NoahZinsmeister/web3-react?branch=master)

![Example GIF](./_assets/example.gif)

## Resources
- **Documentation for `web3-react` is [available on Gitbook](https://noahzinsmeister.gitbook.io/web3-react/).**
- **A live demo of `web3-react` is [available on CodeSandbox](https://codesandbox.io/s/w68nr06x77).**

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

Open a PR to add your project to the list!

## Quickstart

If you want to cut straight to the chase, check out the CodeSandbox demo!

[![Edit web3-react-demo](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/w68nr06x77)

### 1. Install

Since `web3-react` uses [Hooks](https://reactjs.org/docs/hooks-intro.html), make sure that your project relies on the correct alpha builds of `react` and `react-dom`:

```bash
npm install react@16.7.0-alpha.2 react-dom@16.7.0-alpha.2
```

Then, get the npm package:

```bash
npm install web3-react
```

### 2. Setup Connectors
Now, decide how you want users to interact with your dApp. For the vast majority of dApps, this will be with some combination of MetaMask/Infura/WalletConnect. For more details see [Connectors.md](./Connectors.md). If you want `web3-react` to try to automatically initialize some of your connectors, pass the optional `automaticPriority` parameter to as many of your connectors as you want to try, where `automaticPriority` is a number whose sort order determines the connector's precedence order.

Your connectors should end up looking something like the following:

```javascript
import { MetaMaskConnector, InfuraConnector, WalletConnectConnector } from 'web3-react/connectors'

const connectors = {
  metamask: new MetaMaskConnector(),
  infura: new InfuraConnector({ providerURL: 'https://mainnet.infura.io/v3/<YOUR-API-KEY>' }),
  walletConnect: new WalletConnectConnector({
    providerURL: 'https://mainnet.infura.io/v3/<YOUR-API-KEY>',
    dappName: '<YOUR-DAPP-NAME>', bridgeURL: 'https://test-bridge.walletconnect.org'
  })
}
```

### 3. Setup `Web3Provider`
The next step is to setup a `Web3Provider` at the root of your dApp. This ensures that children components are able to take advantage of the `web3-react` context variables. `Web3Provider` takes 5 props:

1. `connectors` (required): An object mapping connector names to Connectors (see the previous section).

1. `passive` (required): Determines whether users must have an active Connector before using your dApp. Passing `true` means that the `InitializingWeb3` screen will be (at least initially) bypassed and all `web3-react` context variables will be inactive. In order to activate the context, call [one of the activation functions](Manager Functions). Passing `false` means that `web3-react` will try to automatically initialize connectors, or show the `InitializingWeb3` screen.

1. `screens` (optional): React Components which will be displayed according to the user's current status. Note that these screens are lazily loaded with [React.lazy](https://reactjs.org/docs/code-splitting.html#reactlazy), and therefore are not SSR-compatible.

  - `InitializingWeb3`: Shown when users are picking between Connectors, or while a Connector is being initialized. It takes props as defined in the source code.

  - `Web3Error`: Shown whenever an error occurs. It takes props as defined in the source code.

1. `libraryName` (optional): `web3.js` or `ethers.js`, depending on which library you wish to use in your dApp.

1. `children` (required): The rest of your dApp.

```javascript
import React from 'react'
import Web3Provider from 'web3-react'

export default function App () {
  return (
    <Web3Provider
      connectors={...}
      passive={...}
      ...
    >
      ...
    </Web3Provider>
  )
}
```

### 4. Using `web3-react`
Finally, you're ready to use `web3-react`!

#### *Recommended* - Hooks
The easiest way to use `web3-react` is with Hooks. For more details see [Hooks.md](./Hooks.md).

```javascript
import React from 'react'
import { useWeb3Context, useAccountBalance } from 'web3-react/hooks'

function MyComponent () {
  const context = useWeb3Context()
  const balance = useAccountBalance()

  return (
    <>
      <p>{context.account}</p>
      <p>{balance}</p>
    </>
  )
}
```

#### *Conditionally Recommended* - Render Props

To use `web3-react` with render props, wrap Components in a `Web3Consumer`. It takes two props:

1. `recreateOnNetworkChange`. A flag that controls whether child components are freshly re-initialized upon network changes.
  - Default value: `true`
1. `recreateOnAccountChange`. A flag that controls whether child components are freshly re-initialized upon account changes.
  - Default value: `true`

Re-initialization is often the desired behavior, though properly written Hooks do not require these flags to be set.

```javascript
import React from 'react'
import { Web3Consumer } from 'web3-react'

function AccountComponent (props) {
  const { account } = props
  return <p>{account}</p>
}

function MyComponent () {
  return (
    <Web3Consumer>
      {context =>
        <AccountComponent account={context.account} />
      }
    </Web3Consumer>
  )
}
```

Note: This pattern will work for arbitrarily deeply nested components. This means that the `Web3Consumer` doesn't necessarily need to be at the top level of your app. There also won't be performance concerns if you choose to use multiple `Web3Consumer`s at different nesting levels.

#### *Not Recommended* - HOCs
If you must, you use `web3-react` with an [HOC](https://reactjs.org/docs/context.html#consuming-context-with-a-hoc). The `withWeb3` wrapper's second argument can optionally be the recreate flags from the render props pattern.


```javascript
import React from 'react'
import { withWeb3 } from 'web3-react'

function MyComponent (props) {
  const { web3 } = props
  const { account } = web3

  return <p>{account}</p>
}

export default withWeb3(MyComponent)
```

Note: The high-level component which includes your `Web3Provider` Component **cannot** be wrapped with `withWeb3`.

## Context

Regardless of how you inject the `web3-context`, it looks like:

```typescript
{
  library             : Library
  networkId           : number
  account             : string | null

  networkReRenderer   : number
  forceNetworkReRender: Function
  accountReRenderer   : number
  forceAccountReRender: Function

  connectorName       : string
  activate            : Function
  activateAccount     : Function
  setConnector        : Function
  resetConnectors     : Function
}
```

### Variables
- `library`: A [web3.js](https://web3js.readthedocs.io/en/1.0/) or [ethers.js](https://github.com/ethers-io/ethers.js/) instance instantiated with the current web3 provider.
- `networkId`: The current active network ID.
- `account`: The current active account.

### Renderers
These variables/functions facilitate the re-rendering of data derived from `account` or `networkId` (such as a user's balance, which can change over time without their actual `account` changing). For how to use these reRenderers, see [src/web3Hooks.ts](./src/web3Hooks.ts). `useAccountEffect` and `useNetworkEffect` convenience wrappers for `useEffect` are available as named exports of `web3-react/hooks`; they take care of re-renders automatically.

- `accountReRenderer`: Forces re-renders of account-derived data when included in `useEffect` hook depends arrays.
- `forceAccountReRender`: A function that triggers a global re-render for Hooks depending on `accountReRenderer`.
- `networkReRenderer`: Forces re-renders of network-derived data when included in `useEffect` hook depends arrays.
- `forceNetworkReRender`: A function that triggers a global re-render for Hooks depending on `networkReRenderer`.

### Manager Functions
- `connectorName`: The name of the current, active connector.
- `activate()`: Callable only when `passive` is true and `web3-react` is uninitialized, this triggers activation, which either shows the `InitializingWeb3` screen, or tries each `automaticPriority` connector.
- `activateAccount()`: Callable only when `activateAccountAutomatically` is set to false for the active connector, and the account has not yet been loaded. Triggers a call to the `getAccount` method of the active connector.
- `setConnector(connectorName)`: Activates a connector.
- `resetConnectors(tryAutomaticAgain, deactivate)`: Resets connectors. `tryAutomaticAgain` controls whether automatic connectors are attempted, and `deactivate` controls whether the application is brought back into a `passive` state.

## Utility Functions

Documentation for the utility functions exported by `web3-react` can be found in [Utilities.md](./Utilities.md).

## Hooks

Documentation for the hooks exported by `web3-react` can be found in [Hooks.md](./Hooks.md).

## Notes
- Prior art for `web3-react` includes:

  - A pure Javascript implementation with some of the same goals: [web3-webpacked](https://github.com/NoahZinsmeister/web3-webpacked).

  - A non-Hooks port of [web3-webpacked](https://github.com/NoahZinsmeister/web3-webpacked) to React that had some problems:
  [web3-webpacked-react](https://github.com/NoahZinsmeister/web3-webpacked-react).

  - A React library with some of the same goals but that uses the deprecated React Context API and not Hooks: [react-web3](https://github.com/coopermaruyama/react-web3).
