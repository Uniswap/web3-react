# `web3-react`

[![npm version](https://badge.fury.io/js/web3-react.svg)](https://www.npmjs.com/package/web3-react)
[![npm downloads](https://img.shields.io/npm/dm/web3-react.svg)](https://www.npmjs.com/package/web3-react)
[![Build Status](https://travis-ci.org/NoahZinsmeister/web3-react.svg?branch=master)](https://travis-ci.org/NoahZinsmeister/web3-react)
[![Coverage Status](https://coveralls.io/repos/github/NoahZinsmeister/web3-react/badge.svg?branch=master)](https://coveralls.io/github/NoahZinsmeister/web3-react?branch=master)

![Example GIF](./_assets/example.gif)

## Resources
- **Documentation for `web3-react` is [available on Gitbook](https://noahzinsmeister.gitbook.io/web3-react/).**
- **A live demo of `web3-react` is [available on CodeSandbox](https://codesandbox.io/s/3x9mvl51yq).**

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

[![Edit web3-react-demo](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/3x9mvl51yq)

### Install

Since `web3-react` uses [Hooks](https://reactjs.org/docs/hooks-intro.html), make sure that your project relies on the correct alpha builds of `react` and `react-dom`:

```bash
npm install react@16.7.0-alpha.2 react-dom@16.7.0-alpha.2
```

Then, get the npm package:

```bash
npm install web3-react
```

### Connectors
Now, decide how you want users to interact with your dApp. For details, see [Connectors.md](./Connectors.md).

### Set up `Web3Provider`
Web3 React exports 3 objects:

1. `Web3Provider` (default export)
  - A Component wrapping the `Web3Context` Provider that ensure children can access the `Web3Context`. `Web3Provider` takes [4 optional props](#1-web3provider-props).

### Using Web3 React: Starter Code

To take advantage of the `Web3Context`, Components must have a `Web3Provider` parent somewhere in their tree. It's recommended that the `Web3Provider` be placed at the top level of your app.

```javascript
import React from 'react'
import ReactDOM from 'react-dom'
import Web3Provider from 'web3-react'

function App () {
  return (
    <Web3Provider ...>
      ...
    </Web3Provider>
  )
}

const rootElement = document.getElementById("root")
ReactDOM.render(<App />, rootElement)
```

This ensures that your app will be able to access the `Web3Context`, which consists of:

```javascript
{
  library: ...,
  account: ...,
  networkId: ...,
  reRenderers: {...}
  connectorName: ...,
  activate: ...,
  activateAccount: ...,
  unsetConnector: ...
}
```

Note: Web3 React guarantees that while the `children` of `Web3Provider` are rendered, none of the these context elements are `null` or `undefined`.

1. `web3js`: A [web3.js](https://web3js.readthedocs.io/en/1.0/) instance instantiated with the current web3 provider.
1. `account`: The current active account.
1. `networkId`: The current active network ID.
1. `reRenderers`: Variables and functions to facilitate the re-rendering of data derived from `account` or `networkId` (such as a user's balance, which can change over time without their actual `account` changing). For how to use these reRenderers, see [src/web3Hooks.js](./src/web3Hooks.js). `useAccountEffect` and `useNetworkEffect` convenience wrappers for `useEffect` are available as named exports of `web3-react/hooks`; they take care of re-renders automatically.
 - `accountReRenderer`: Forces re-renders of account-derived data.
 - `forceAccountReRender`: A function that triggers a global re-render for Hooks depending on `accountReRenderer`.
 - `networkReRenderer`: Forces re-renders of network-derived data.
 - `forceNetworkReRender`: A function that triggers a global re-render for Hooks depending on `networkReRenderer`.


### Using Web3 React: Hooks - *Recommended*
The easiest way to use Web3 React is with Hooks! [**All Hooks exported by Web3 React are documented in docs/Hooks.md.**](./docs/Hooks.md)

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

### Using Web3 React: Render Props - *Conditionally Recommended*

1. `Web3Consumer` (named export)
  - A Component wrapping the `Web3Context` Consumer that enables children to access the `Web3Context` via a render prop. `Web3Consumer` takes [2 optional props](#2-web3consumer-props).

To access the `Web3Context` with a render prop, wrap Components in a `Web3Consumer`.

```javascript
import React from 'react'
import Web3Provider, { Web3Consumer } from 'web3-react'

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

### Using Web3 React: HOCs - *Not Recommended*

1. `withWeb3` (named export)
  - This [HOC](https://reactjs.org/docs/context.html#consuming-context-with-a-hoc) gives passed Components access to the `Web3Context` via an injected `web3` prop. `withWeb3` takes [1 optional argument](#3-withWeb3-arguments).


If you really have to, you can give Components access to the `Web3Context` via a `web3` prop by wrapping them with `withWeb3`.

```javascript
import React from 'react'
import { withWeb3 } from 'web3-react'

function MyComponent (props) {
  const { web3 } = props
  const { account } = web3

  return <p>{account}</p>
}

const MyComponentWrapped = withWeb3(MyComponent)
```

Note: The high-level component which includes your `Web3Provider` Component **cannot** be wrapped with `withWeb3`.

## Exhaustive Documentation

- Documentation for the utility functions exported by Web3 React can be found separately in [docs/Utilities.md](./docs/Utilities.md).

- Documentation for the Hooks exported by Web3 React can be found separately in [docs/Hooks.md](./docs/Hooks.md).

### 1. `Web3Provider` props

The `Web3Provider` Component takes 5 optional props:

1. `screens`: React Components which will be displayed according to the web3 status of a user's browser. To see the default screens, play around with [the CodeSandbox sample app](https://codesandbox.io/s/3x9mvl51yq) or check out [the implementation](./src/defaultScreens). Note that these screens are lazily loaded with [React.lazy](https://reactjs.org/docs/code-splitting.html#reactlazy), and therefore are not SSR-compatible.
  - `Initializing`: Shown when Web3 React is being initialized. This screen is typically displayed only very briefly, or while requesting one-time account permission.
    - Default: The Component only appears after 1 second.

  - `NoWeb3`: Shown when no injected `web3` variable is found.
    - Default: The Component encourages users to install [MetaMask](https://metamask.io/) or download [Trust](https://trustwalletapp.com/).

  - `PermissionNeeded`: Shown when users deny your dApp permission to access their account. Denying access disables the entire dApp unless the `accountRequired` flag is set to `false`.
    - Default: The Component instructs users to grant your dApp access to their account.

  - `UnlockNeeded`: Shown when no account is available.
    - Default: The Component encourages users to unlock their wallet. This could possibly be combined with the `PermissionNeeded` Component (suggestions welcome).

  - `UnsupportedNetwork`: Shown when the user is on a network not in the `supportedNetworks` list. The list of supported network IDs is passed to this component in a `supportedNetworkIds` prop.
    - Default value: The Component encourages users to connect to any of the networks in the `supportedNetworks` list.

  - `Web3Error`: Shown whenever an error occurs in the polling process for account and network changes. The error is passed to this Component as an `error` prop.
    - Default: The Component displays the text of the passed error to the user.

2. `pollTime`: The poll interval for account and network changes (in milliseconds). The current recommendation is to poll for [account](https://github.com/MetaMask/faq/blob/master/DEVELOPERS.md) and [network](https://medium.com/metamask/breaking-change-no-longer-reloading-pages-on-network-change-4a3e1fd2f5e7) changes.
  - Default: `1000`

3. `supportedNetworks`: Enforces that the web3 instance is connected to a particular network. If the detected network ID is not in the passed list, the `UnsupportedNetwork` screen will be shown. Supported network IDs are: `1` (Mainnet), `3` (Ropsten), `4` (Rinkeby), and `42` (Kovan).
  - Default: `[1, 3, 4, 42]`

4. `accountRequired`: If false, does not show the `UnlockNeeded` screen if a user does not expose any of their accounts.
  - Default: `true`

5. `children`: React Components to be rendered upon successful Web3 React initialization.

### 2. `Web3Consumer` Props
1. `recreateOnNetworkChange`. A flag that controls whether child components are freshly re-initialized upon network changes.
  - Default value: `true`
1. `recreateOnAccountChange`. A flag that controls whether child components are freshly re-initialized upon account changes.
  - Default value: `true`

Re-initialization is often the desired behavior, though properly written Hooks should not require these flags to be set.

### 3. `withWeb3` Arguments
Flags that can be passed in the second argument to `withWeb3`:

1. `recreateOnNetworkChange`. See above.
1. `recreateOnAccountChange`. See above.

```javascript
withWeb3(..., { ... })
```

## Notes
- Prior art for Web3 React includes:

  - A pure Javascript implementation with some of the same goals: [web3-webpacked](https://github.com/NoahZinsmeister/web3-webpacked).

  - A non-Hooks port of [web3-webpacked](https://github.com/NoahZinsmeister/web3-webpacked) to React that had some problems:
  [web3-webpacked-react](https://github.com/NoahZinsmeister/web3-webpacked-react).

  - A React library with some of the same goals but that unfortunately uses the deprecated React Context API and does not use Hooks: [react-web3](https://github.com/coopermaruyama/react-web3).

- Right now, Web3 React is opinionated in the sense that it relies on [web3.js](https://web3js.readthedocs.io/en/1.0/) in lieu of possible alternatives like [ethjs](https://github.com/ethjs/ethjs) or [ethers.js](https://github.com/ethers-io/ethers.js/). In the future, it's possible that this restriction will be relaxed. It's not clear how this would best be achieved, however, so ideas and comments are welcome. Open an [issue](https://github.com/NoahZinsmeister/web3-react/issues/new) or [PR](https://github.com/NoahZinsmeister/web3-react/pulls)!
