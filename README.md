# web3-react (beta)

[![CI](https://github.com/Uniswap/web3-react/actions/workflows/CI.yml/badge.svg)](https://github.com/Uniswap/web3-react/actions/workflows/CI.yml)

_Looking for the prior version of this library? It's available on the [v6 branch](https://github.com/Uniswap/web3-react/tree/v6)._

## [Example](https://web3-react-mu.vercel.app/)

This is a hosted version of [packages/example-next](packages/example-next).

## Packages

| Package                                                   | Version                                                                                                                                       | Size                                                                                                                                                             | Link                                                                      |
|-----------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------|---------------------------------------------------------------------------|
| [`@web3-react/types`](packages/types)                     | [![npm](https://img.shields.io/npm/v/@web3-react/types/beta.svg)](https://www.npmjs.com/package/@web3-react/types/v/beta)                     | [![minzip](https://img.shields.io/bundlephobia/minzip/@web3-react/types/beta.svg)](https://bundlephobia.com/result?p=@web3-react/types@beta)                     |                                                                           |
| [`@web3-react/store`](packages/store)                     | [![npm](https://img.shields.io/npm/v/@web3-react/store/beta.svg)](https://www.npmjs.com/package/@web3-react/store/v/beta)                     | [![minzip](https://img.shields.io/bundlephobia/minzip/@web3-react/store/beta.svg)](https://bundlephobia.com/result?p=@web3-react/store@beta)                     |                                                                           |
| [`@web3-react/core`](packages/core)                       | [![npm](https://img.shields.io/npm/v/@web3-react/core/beta.svg)](https://www.npmjs.com/package/@web3-react/core/v/beta)                       | [![minzip](https://img.shields.io/bundlephobia/minzip/@web3-react/core/beta.svg)](https://bundlephobia.com/result?p=@web3-react/core@beta)                       |                                                                           |
| **Connectors**                                            |                                                                                                                                               |                                                                                                                                                                  |                                                                           |
| [`@web3-react/eip1193`](packages/eip1193)                 | [![npm](https://img.shields.io/npm/v/@web3-react/eip1193/beta.svg)](https://www.npmjs.com/package/@web3-react/eip1193/v/beta)                 | [![minzip](https://img.shields.io/bundlephobia/minzip/@web3-react/eip1193/beta.svg)](https://bundlephobia.com/result?p=@web3-react/eip1193@beta)                 | [EIP-1193](https://github.com/ethereum/EIPs/blob/master/EIPS/eip-1193.md) |
| [`@web3-react/empty`](packages/empty)                     | [![npm](https://img.shields.io/npm/v/@web3-react/empty/beta.svg)](https://www.npmjs.com/package/@web3-react/empty/v/beta)                     | [![minzip](https://img.shields.io/bundlephobia/minzip/@web3-react/empty/beta.svg)](https://bundlephobia.com/result?p=@web3-react/empty@beta)                     |                                                                           |
| [`@web3-react/gnosis-safe`](packages/gnosis-safe)         | [![npm](https://img.shields.io/npm/v/@web3-react/gnosis-safe/beta.svg)](https://www.npmjs.com/package/@web3-react/gnosis-safe/v/beta)         | [![minzip](https://img.shields.io/bundlephobia/minzip/@web3-react/gnosis-safe/beta.svg)](https://bundlephobia.com/result?p=@web3-react/gnosis-safe@beta)         | [Gnosis Safe](https://gnosis-safe.io/)                                    |
| [`@web3-react/metamask`](packages/metamask)               | [![npm](https://img.shields.io/npm/v/@web3-react/metamask/beta.svg)](https://www.npmjs.com/package/@web3-react/metamask/v/beta)               | [![minzip](https://img.shields.io/bundlephobia/minzip/@web3-react/metamask/beta.svg)](https://bundlephobia.com/result?p=@web3-react/metamask@beta)               | [MetaMask](https://metamask.io/)                                          |
| [`@web3-react/network`](packages/network)                 | [![npm](https://img.shields.io/npm/v/@web3-react/network/beta.svg)](https://www.npmjs.com/package/@web3-react/network/v/beta)                 | [![minzip](https://img.shields.io/bundlephobia/minzip/@web3-react/network/beta.svg)](https://bundlephobia.com/result?p=@web3-react/network@beta)                 |                                                                           |
| [`@web3-react/url`](packages/url)                         | [![npm](https://img.shields.io/npm/v/@web3-react/url/beta.svg)](https://www.npmjs.com/package/@web3-react/url/v/beta)                         | [![minzip](https://img.shields.io/bundlephobia/minzip/@web3-react/url/beta.svg)](https://bundlephobia.com/result?p=@web3-react/url@beta)                         |                                                                           |
| [`@web3-react/walletconnect`](packages/walletconnect)     | [![npm](https://img.shields.io/npm/v/@web3-react/walletconnect/beta.svg)](https://www.npmjs.com/package/@web3-react/walletconnect/v/beta)     | [![minzip](https://img.shields.io/bundlephobia/minzip/@web3-react/walletconnect/beta.svg)](https://bundlephobia.com/result?p=@web3-react/walletconnect@beta)     | [WalletConnect](https://walletconnect.org/)                               |
| [`@web3-react/coinbase-wallet`](packages/coinbase-wallet) | [![npm](https://img.shields.io/npm/v/@web3-react/coinbase-wallet/beta.svg)](https://www.npmjs.com/package/@web3-react/coinbase-wallet/v/beta) | [![minzip](https://img.shields.io/bundlephobia/minzip/@web3-react/coinbase-wallet/beta.svg)](https://bundlephobia.com/result?p=@web3-react/coinbase-wallet@beta) | [Coinbase Wallet](https://docs.cloud.coinbase.com/wallet-sdk/docs)        |

## Get Started

- `yarn`
- `yarn bootstrap`
- `yarn start`

In addition to compiling each package in watch mode, this will also spin up [packages/example-next](packages/example-next) on [localhost:3000](http://localhost:3000/). (It will also spin up [packages/example-cra](packages/example-cra) on [localhost:3001](http://localhost:3001/), but this is just a skeleton app for testing compatibility.)

## Run Tests

- `yarn build`
- `yarn test --watch`

## Add a Dependency

- `yarn lerna add <DEPENDENCY> --scope <PACKAGE>`

## Remove a Dependency

- Delete the relevant `package.json` entry

Because of a [lerna bug](https://github.com/lerna/lerna/issues/1883), it's not possible to prune `yarn.lock` programmatically, so regenerate it manually:

- `yarn lerna exec "rm -f yarn.lock" --scope <SUBPACKAGE>`
- `yarn clean --scope <SUBPACKAGE>`
- `yarn bootstrap`

## Publish

- `yarn lerna publish [--dist-tag]`

## Documentation

This version of web3-react is still in beta, so unfortunately documentation is pretty sparse at the moment. [packages/example-next](packages/example-next), TSDoc comments, and the source code itself are the best ways to get an idea of what's going on. More thorough documentation is a priority as development continues!

## Upgrading Connector Dependencies

Some connectors have one or more dependencies that are specific to the connection method in question. For example, the walletconnect connector relies on `@walletconnect/ethereum-provider` package to handle a lot of the connection logic. Often, you may wish to upgrade to the latest version of a client package, to take advantage of the latest features. web3-react makes the process of upgrading client packages fairly painless by specifying them as [`peerDependencies`](https://docs.npmjs.com/cli/v8/configuring-npm/package-json#peerdependencies). This means that you have to explicitly install client packages, and therefore may transparently switch between any version that agrees with the semver specified in the connector (usually any matching major).

## Third-Party Connectors

The decision to publish a connector under the @web3-react namespace is fully up to the discretion of the team. However, third-party connectors are always welcome! This library was designed to be highly modular, and you should be able to draw inspiration from the existing connectors to write your own. That connector can live inside your codebase, or even be published as a standalone package. A selection of third-party connectors that have widespread usage may be featured below, PRs modifying this list are welcome.

## Upgrading from v6

While the internals of web3-react have changed fairly dramatically between v6 and v8, the hope is that usage don't have to change too much when upgrading. Once you've migrated to the new connectors and state management patterns, you should be able to use the hooks defined in @web3-react/core, in particular `useWeb3React` (or `usePriorityWeb3React`), as more or less drop-in replacements for the v6 hooks. The big benefit in v8 is that hooks are now per-connector, as opposed to global, so no more juggling between connectors/multiple roots!

## Migrating from v6 to v8 (with Web3ReactProvider)

How we configure connectors has changed in v8. Once configured, the web3React() hook will work just as v6 did, with a few changes to the props it returns.

Let's start by upgrading the packages. This example is using MetaMask and Coinbase Wallet connectors. The @^ will let you choose what package version to install.


### Updating Packages

```ts
yarn remove @web3-react/injected-connector @web3-react/walletlink-connector

yarn upgrade @web3-react/core@^
yarn upgrade @coinbase/wallet-sdk@^
yarn add @web3-react/metamask@^
yarn add @web3-react/coinbase-wallet@^
```

### Configuring Connectors

#### V6

Here is how we used to setup the connectors.

```ts
const supportedChainIds = [1, 5, 10, 56, 137, 43114, 42161, 42220]

export const connectorNames = {
  Injected: 'Injected',
  WalletLink: 'WalletLink',
}

export const connectorsByName = {
  Injected: injected,
  WalletLink: walletlink,
}

export const injected = new InjectedConnector({
  supportedChainIds,
})

export const walletlink = new WalletLinkConnector({
  url,
  appName,
  supportedChainIds,
  appLogoUrl,
})
```

#### V8

Connectors are now setup independently, in which you may get the connector and it's hooks directly, meaning you don't have to use a Web3ReactProvider. 

We will use these exports from the connectors to setup our Web3ReactProvider, so we can select what conector we want our useWeb3React hook to use.

#### File: metaMask.ts
```ts
import { initializeConnector } from '@web3-react/core'
import { MetaMask } from '@web3-react/metamask'

export const [metaMask, hooks] = initializeConnector<MetaMask>(
  (actions) => new MetaMask({ actions, options: { mustBeMetaMask: true } })
)
```

#### File: coinbaseWallet.ts
```ts
import { CoinbaseWallet } from '@web3-react/coinbase-wallet'
import { initializeConnector } from '@web3-react/core'

export const [coinbaseWallet, hooks] = initializeConnector<CoinbaseWallet>(
  (actions) =>
    new CoinbaseWallet({
      actions,
      options: {
        url,
        appName,
        appLogoUrl,
      },
    })
)
```

If you want to keep the helper to get a connector by its name like in v6, you can do something like this.

```ts
import { metaMask } from './connectors/metaMask'
import { coinbaseWallet } from './connectors/coinbaseWallet'

export const connectorNames = {
    metaMask: 'MetaMask',
    coinbase: 'CoinbaseWallet'
}

export const connectorsByName = {
  MetaMask: metaMask,
  CoinbaseWallet: coinbaseWallet,
}
```

### Setting up the Web3ReactProvider

#### V6

Your apps index should be setup similar to this. We no longer need to inject a libary like this as each Connector has been setup with their own.

```ts
function getLibrary(provider) {
  const library = new providers.Web3Provider(provider)
  library.pollingInterval = 8_000
  return library
}

root.render(
  <StrictMode>
    <Web3ReactProvider getLibrary={getLibrary}>
        <App />
    </Web3ReactProvider>
  </StrictMode>
)
```

#### V8

With the new configuration, we pull in the connectors we configured and pass them to the Web3ReactProvider.

The optional defaultSelectedConnector prop will let you choose the default selected wallet by the app. If not passed, the selectedConnector will be determined by finding the first "active" connector in the "connectors" array. If there are no "active" connectors, it will be the first element in the "connectors" array.

```ts
import { Web3ReactProvider } from '@web3-react/core'

import { useSelector } from 'react-redux'
import { hooks as metaMaskHooks, metaMask } from './connectors/metaMask'
import {
  coinbaseWallet,
  hooks as coinbaseWalletHooks,
} from './connectors/coinbaseWallet'

const connectors = [
  [metaMask, metaMaskHooks],
  [coinbaseWallet, coinbaseWalletHooks],
]

root.render(
  <StrictMode>
    <Web3ReactProvider 
      connectors={connectors}
      defaultSelectedConnector={coinbaseWallet}>
        <App />
    </Web3ReactProvider>
  </StrictMode>
)
```

That's it for setup, you're now on v8! 🚀

### Swtiching the selectedConnector

You can select what connector you want the Web3ReactProvider to use with a new prop called "setSelectedConnector". If you don't pass it a connector, it will reset to the defaultSelectedConnector if one is provided, or to the priorityConnector.

```ts
import { metaMask } from './connectors/metaMask'

const {
    setSelectedConnector,
  } = useWeb3React()

return (
    <button onClick={() => setSelectedConnector(metaMask)}>
        Reset to Priority
    </button>
)
```
