# Web3 React

[![npm version](https://badge.fury.io/js/web3-react.svg)](https://badge.fury.io/js/web3-react)
[![Build Status](https://travis-ci.org/NoahZinsmeister/web3-react.svg?branch=master)](https://travis-ci.org/NoahZinsmeister/web3-react)
[![Coverage Status](https://coveralls.io/repos/github/NoahZinsmeister/web3-react/badge.svg?branch=master)](https://coveralls.io/github/NoahZinsmeister/web3-react?branch=master)

Web3 React is a drop in solution for building single-page Ethereum dApps in React. Yes, it uses [Hooks](https://reactjs.org/docs/hooks-intro.html)!

[![Edit web3-react-demo](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/3x9mvl51yq)

![Example GIF](./_assets/example.gif)

The marquee features of Web3 React are:

- A robust management framework for the global `web3` object injected into browsers by [MetaMask](https://metamask.io/), [Trust](https://trustwalletapp.com/), etc. The framework exposes the current account, the current network ID, and an instantiated [web3.js](https://web3js.readthedocs.io/en/1.0/) instance to Components via a [React Context](https://reactjs.org/docs/context.html).

- Several [React Hooks](https://reactjs.org/docs/hooks-intro.html) which fetch Ether and ERC20 balances, keep account-derived data up to date, etc.

- A collection of utility functions that facilitate data signing, formatting [Etherscan](https://etherscan.io/) links, etc.

- A front-to-back solution for sending transactions that abstracts away from common annoyances like estimating gas usage and fetching current gas prices.

## Sample Implementations
Many of the patterns and APIs described below can be seen in the CodeSandbox demo.

[![Edit web3-react-demo](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/3x9mvl51yq)

Open a PR to add your project here!

## Quickstart

Install the npm package:

```bash
npm install web3-react
```

Web3-react exports 4 objects:

1. `Web3Provider`. The default export. This Component wraps a React Context Provider to ensure that child components are able to access the `Web3Context`. `Web3Provider` takes [4 optional props](#1-web3provider-props).

2. `Web3Context`. A named export. A React Context object that can be used in Hooks or Components with: `useContext(Web3Context)`. `Web3Context` consists of [4 elements](#2-web3context-elements).

3. `Web3Consumer`: A named export. This Component wraps a React Context Consumer to enable users to access the `Web3Context` via a render prop. `Web3Consumer` takes [2 optional props](#3-web3consumer-props)

4. `withWeb3`: A named export. This [HOC](https://reactjs.org/docs/context.html#consuming-context-with-a-hoc) enables users to access the `Web3Context` by injecting a `web3` prop into wrapped Components. `Web3Consumer` takes [1 optional argument](#4-withWeb3-arguments).

### Starter Code

To use the `Web3Context`, a Component must have a `Web3Provider` parent.  needs needs to use Web3 React has   Your `App` should always have a `Web3Provider`  code below is a minimum viable example of Web3 React.

Any Component inside the `Web3Consumer` render prop will have access to web3 variables via the `context` object.



```javascript
import React from 'react'
import ReactDOM from 'react-dom'
import Web3Provider from 'web3-react'

function App () {
  return (
    <Web3Provider supportedNetworks={[1]}>
      ...
    </Web3Provider>
  )
}

const rootElement = document.getElementById("root");
ReactDOM.render(<App />, rootElement);
```

### Using Web3 React: Hooks - *Recommended*
The easiest way to use Web3 React is with Hooks! All Hooks exported by Web3 React are documented in [docs/Hooks.md](./docs/Hooks.md).

```javascript
import { useContext } from 'react'
import { Web3Context } from 'web3-react'
import { useAccountBalance } from 'web3-react/hooks'

function MyComponent () {
  const context = useContext(Web3Context)
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
In some situations, it could be useful to access the `Web3Context` with a render prop.

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

Note that this pattern will work for arbitrarily deeply nested components. This means that the `Web3Consumer` doesn't necessarily need to be at the root of your app. There also won't be performance concerns if you choose to use multiple `Web3Consumer`s at different nesting levels.

### Using Web3 React: HOCs - *Not Recommended*

HOCs are less than ideal for a number of reasons, so using Hooks or render props are officially recommended over this pattern.

```javascript
import React from 'react'
import { withWeb3 } from 'web3-react';

function MyComponent (props) {
  const { web3 } = props
  const { account } = web3

  return <p>{account}</p>
}

const MyComponentWrapped = withWeb3(MyComponent)
```

The `withWeb3` HOCs injects the `Web3Context` into a `web3` prop. Note that the high-level component which includes your `Web3Provider` declaration **cannot** be wrapped with `withWeb3`.

## Exhaustive Documentation

### 1. `Web3Provider` Props

The `Web3Provider` Component takes 4 optional props:

```javascript
const defaultScreens = {
  Initializing:       Initializing,
  NoWeb3:             NoWeb3,
  PermissionNeeded:   PermissionNeeded,
  UnlockNeeded:       UnlockNeeded,
  UnsupportedNetwork: UnsupportedNetwork,
  Web3Error:          Web3Error
}

const web3ProviderDefaultProps = {
  screens:           defaultScreens,
  pollTime:          1000,
  supportedNetworks: [1, 3, 4, 42]
}
```

1. `screens`: React Components which will be displayed accordingly depending on the web3 status of a user's browser. To see the default screens play around with [the CodeSandbox sample app](https://codesandbox.io/s/3x9mvl51yq) or check out [the implementation](./src/defaultScreens).
  - `Initializing`: Shown when web3 is being initialized. This screen is typically displayed only very briefly, or while requesting one-time account permission.
    - Default value: The default `Initializing` Component only appears after 1 second.

  - `NoWeb3`: Shown when no injected web3 is found.
    - Default value: The default `NoWeb3` Component encourages users to install [MetaMask](https://metamask.io/) or download [Trust](https://trustwalletapp.com/).

  - `PermissionNeeded`: Shown when users deny permission to access their account. Right now, denying access disables the entire app. If this is an issue for your use case, i.e. if your dApp supports generic, read-only experiences, please [file an issue](https://github.com/NoahZinsmeister/web3-react/issues) or [submit a PR](https://github.com/NoahZinsmeister/web3-react/pulls)!
      - Default value: The default `PermissionNeeded` Component encourages users to grant the app access to their accounts.

  - `UnlockNeeded`: Shown when no account is available.
    - Default value: The default `UnlockNeeded` Component encourages users to unlock their wallet. This could possibly be combined with the `PermissionNeeded` Component. Suggestions welcome!

  - `UnsupportedNetwork`: Shown when the user is on a network not in the `supportedNetworks` list. The list of names of supported networks is passed to this component as a `supportedNetworkNames` prop.
    - Default value: The default `UnsupportedNetwork` Component encourages users to connect to any of the networks in the `supportedNetworks` list.

  - `Web3Error`: Shown whenever a web3 error occurs in the polling process for account and network changes. The error is passed to this Component as an `error` prop.
    - Default value: The default `Web3Error` Component displays the text of the passed error to the user.

2. `pollTime`: The poll interval (in milliseconds). The current recommendation is to poll for [account](https://github.com/MetaMask/faq/blob/master/DEVELOPERS.md) and [network](https://medium.com/metamask/breaking-change-no-longer-reloading-pages-on-network-change-4a3e1fd2f5e7) changes.
- Default value: `1000`

3. `supportedNetworks`: Enforces that the web3 instance is connected to a particular network. If the detected network id is not in the passed list, the `UnsupportedNetwork` screen will be shown. Supported network ids are: `1` (Mainnet), `3` (Ropsten), `4` (Rinkeby), and `42` (Kovan).
  - Default value: `[1, 3, 4, 42]`

4. `children`: React Components to be rendered upon successful web3 initialization.

### 2. `Web3Context` Elements
```javascript
{
  web3js: ...,
  account: ...,
  networkId: ...,
  utilities: {...},
  reRenderers: {...}
}
```

The functions available under the `utilities` key are documented in [docs/Utilities.md](./docs/Utilities.md). The values available under the `reRenderers` key are meant to facilitate the re-rendering of data derived from `account` or `networkId`. For how to use these, see [src/web3Hooks.js](./src/web3Hooks.js). A `useReRendererEffect` convenience wrapper for `useEffect` is available as a named export of `web3-react/hooks`, which takes care of re-renders automatically.

1. `accountReRenderer`: A counter that forces re-renders of account-derived data in `useEffect` (like balances after sending a transaction).
2. `forceAccountReRender`: A function that triggers a global re-render for `useEffect` Hooks that depend on `accountReRenderer`.
3. `networkReRenderer`: A counter that forces re-renders of network-derived data in `useEffect` (like data on the latest known block).
4. `forceAccountReRender`: A function that triggers a global re-render for `useEffect` Hooks that depend on `networkReRenderer`.

### 3. `Web3Consumer` Props
1. `recreateOnNetworkChange`. This flag controls whether children components are freshly re-initialized upon network changes.
  - Default value: `true`
2. `recreateOnAccountChange`. This flag controls whether children components are freshly re-initialized upon account changes.
  - Default value: `true`

Re-renders are typically the desired behavior (for example, the calculated balance of a user account should be updated automatically on account change). For more information on derived state, see this article [on derived state in React.](https://reactjs.org/blog/2018/06/07/you-probably-dont-need-derived-state.html).

### 4. `withWeb3` Arguments
```javascript
withWeb3(..., { ... })
```

Keys of the second argument to `withWeb3` can be one of:
1. `recreateOnNetworkChange`. See above.
2. `recreateOnAccountChange`. See above.

## Notes
- Prior art for Web3 React includes:

  - A pure Javascript implementation with some of the same goals: [web3-webpacked](https://github.com/NoahZinsmeister/web3-webpacked).

  - A non-Hooks port of [web3-webpacked](https://github.com/NoahZinsmeister/web3-webpacked) to React that had some problems:
  [web3-webpacked-react](https://github.com/NoahZinsmeister/web3-webpacked-react).

  - A React library with some of the same goals but that unfortunately uses the deprecated React Context API and does not use Hooks: [react-web3](https://github.com/coopermaruyama/react-web3).

- Right now, Web3 React is opinionated in the sense that it relies on [web3.js]((https://web3js.readthedocs.io/en/1.0/)) in lieu of possible alternatives like [ethjs](https://github.com/ethjs/ethjs) or [ethers.js](https://github.com/ethers-io/ethers.js/). In the future, it's possible that this restriction will be relaxed. It's not clear how this would best be achieved, however, so ideas and comments are welcome. Open an [issue](https://github.com/NoahZinsmeister/web3-react/issues/new) or [PR](https://github.com/NoahZinsmeister/web3-react/pulls)!
