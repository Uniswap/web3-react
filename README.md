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

Connectors are now setup independently, in which you may get the connector and its hooks directly, meaning you don't have to use a Web3ReactProvider. If you want a to connect a bunch of connectors, and be able to select what connector to use in the useWeb3React hook, the Web3ReactProvider is what you're looking for.

Let's start by upgrading the packages. This example is using MetaMask and Coinbase Wallet connectors. The @^ will let you choose what package version to install. @web3-react/store and @web3-react/types will be installed as a dependency of @web3-react/core. Zustand will also be installed as a dependency of @web3-react/core, which is used by each connector to keep state. All wallet connectors have new packages so remove all the connectors you have. Keep in mind not all connectors available in v6 are in v8.

### Updating Packages

```ts
// Remove the v6 connectors
yarn remove @web3-react/injected-connector @web3-react/walletlink-connector

// Upgrade to the newest versions
yarn upgrade @web3-react/core@^
yarn upgrade @coinbase/wallet-sdk@^

// Add the new connectors
yarn add @web3-react/metamask@^
yarn add @web3-react/coinbase-wallet@^
```

### Configuring Connectors

#### v6

Here is how we used to setup the connectors.

```ts
const supportedChainIds = [1, 5, 10, 56, 137, 43114, 42161, 42220]

export const injected = new InjectedConnector({
  supportedChainIds,
})

export const walletlink = new WalletLinkConnector({
  url,
  appName,
  supportedChainIds,
  appLogoUrl,
})

export const connectorsByName = {
  Injected: injected,
  WalletLink: walletlink,
}

```

#### v8

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

export const connectorsByName = {
  MetaMask: metaMask,
  CoinbaseWallet: coinbaseWallet,
}
```

### Setting up the Web3ReactProvider

#### v6

Your apps index should be setup similar to this. We no longer need to inject a library like this as each Connector has been setup with their own.

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

#### v8

With the new configuration, we pull in the connectors we configured and pass them to the Web3ReactProvider.

The optional defaultSelectedConnector prop will let you choose the default selected wallet by the app. If not passed, the selectedConnector will be determined by finding the first "active" connector in the "connectors" array. If there are no "active" connectors, it will be the first element in the "connectors" array, in which the selectedConnector and the priorityConnector are the same.

```ts
import { Web3ReactProvider } from '@web3-react/core'
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
### Switching the selectedConnector

You can select what connector you want the Web3ReactProvider to use with a new prop called "setSelectedConnector". If you don't pass it a connector, it will reset to the defaultSelectedConnector if one was provided, or to the priorityConnector.

```ts
import { metaMask } from './connectors/metaMask'

const {
    setSelectedConnector,
  } = useWeb3React()

return (
    <>
        <button onClick={() => setSelectedConnector(metaMask)}>
            Select
        </button>
        <button onClick={() => setSelectedConnector()}>
            Reset to default
        </button>
    </>
)
```

That's it for setup, you're now on v8! 🚀

Let's check out what changed in the useWeb3React() hooks.

## Hook Changes

v8 has added and removed some props from the useWeb3React hook. The error prop is no longer around and is now handled per connector.

```ts
// v6
const {
    // Still in v8
    connector,
    chainId,
    account,
    active, // Renamed to "isActive"
    library, // Renamed to "provider"

    // Removed: Now per "connector"
    activate,
    deactivate,
    setError,
    error,
} = useWeb3React()

// v8
const {
    // In v8 these helper props are from the selectedConnector of the Web3Provider. 
    // These are mapped from the selectedConnector within 
    // the Web3Provider using the useSelected*() hooks.
    connector,
    chainId,
    accounts,
    account,
    isActivating, // New
    isActive, // Formerly "active"
    provider, // Formerly "library"
    ENSNames, // New
    ENSName, // New
    
    // Used to select the connector to be used by the useWeb3React hook. 
    // Passing no param will reset to the defaultSelectedConnector
    // if one was provided, or to the priorityConnector.
    setSelectedConnector,

    hooks: { 
        // Notice there is no useSelectedConnector hook,
        // that's because these useSelected*() hooks take in a 
        // connector to get the relevant hook from the connector.
        // This is useful if you wanted to get a connectors hooks through
        // the Web3Provider without setting it as the selectedConnector.
        useSelectedStore, // Note: No helper prop above
        useSelectedChainId,
        useSelectedAccounts,
        useSelectedIsActivating,
        useSelectedAccount,
        useSelectedIsActive,
        useSelectedProvider,
        useSelectedENSNames,
        useSelectedENSName,

        // These hooks are taken from the first "active" connector found
        // in the "connectors" array that you passed into the Web3Provider.
        usePriorityConnector,
        usePriorityStore,
        usePriorityChainId,
        usePriorityAccounts,
        usePriorityIsActivating,
        usePriorityAccount,
        usePriorityIsActive,
        usePriorityProvider,
        usePriorityENSNames,
        usePriorityENSName,
     },
} = useWeb3React()

```

### Using the useSelected*() hook

```ts
import { metaMask } from './connectors/metaMask'

const {
    hooks: { 
        useSelectedStore,
        useSelectedChainId,
        useSelectedAccounts,
        useSelectedIsActivating,
        useSelectedAccount,
        useSelectedIsActive,
        useSelectedProvider,
        useSelectedENSNames,
        useSelectedENSName,
    }
} = useWeb3React()

const chainId = useSelectedChainId(metaMask)
```

### Using the usePriority*() hook

The Priority connector is the first "active" connector found in the "connectors" array you passed into the Web3ReactProvider.

```ts
const {
    hooks: { 
        usePriorityStore,
        usePriorityChainId,
        usePriorityAccounts,
        usePriorityIsActivating,
        usePriorityAccount,
        usePriorityIsActive,
        usePriorityProvider,
        usePriorityENSNames,
        usePriorityENSName,
    }
} = useWeb3React()

const chainId = usePriorityChainId()
```

## Hooking to a Connector without Web3ReactProvider

With connectors being independent of each other, we can hook into them directly without using the Web3ReactProvider.

```ts
import { hooks } from './connectors/metaMask'

const { 
    useAccount, 
    useAccounts, 
    useChainId, 
    useENSName, 
    useENSNames, 
    useIsActivating,
    useIsActive, 
    useProvider 
} = hooks

const [
    account, 
    accounts, 
    chainId, 
    ENSName, 
    ENSNames, 
    isActivating, 
    isActive, 
    provider
] = [
    useAccount(), // Derived hook
    useAccounts(), // State hook
    useChainId(), // State hook
    useENSName(), // Augmented hook
    useENSNames(), // Augmented hook
    useIsActivating(), // State hook
    useIsActive(), // Derived hook
    useProvider(), // Augmented hook
]

console.log(account, accounts, chainId, ENSName, ENSNames, isActivating, isActive, provider)

```

You can make exposing per connector hooks easier by putting the above code into a helper function.

```ts
import { hooks: metaMaskHooks } from './connectors/metaMask'

const {
    account, 
    accounts, 
    chainId, 
    ENSName, 
    ENSNames, 
    isActivating, 
    isActive, 
    provider
} = getPropsFromConnectorHooks(metaMaskHooks)

// Helper
function getPropsFromConnectorHooks(hooks: Web3ReactHooks) {
    const { 
        useAccount, 
        useAccounts, 
        useChainId, 
        useENSName, 
        useENSNames, 
        useIsActivating,
        useIsActive, 
        useProvider 
    } = hooks

    const [
        account, 
        accounts, 
        chainId, 
        ENSName, 
        ENSNames, 
        isActivating, 
        isActive, 
        provider
    ] = [
        useAccount(), // Derived hook
        useAccounts(), // State hook
        useChainId(), // State hook
        useENSName(), // Augmented hook
        useENSNames(), // Augmented hook
        useIsActivating(), // State hook
        useIsActive(), // Derived hook
        useProvider(), // Augmented hook
    ]

    return {
        account, 
        accounts, 
        chainId, 
        ENSName, 
        ENSNames, 
        isActivating, 
        isActive, 
        provider
    }
}
```

## Connectors

How connectors are structured now is a lot different than v6. Let's see what's new.

```ts
// Initalize a connection
activate()
// Un-initiate a connection
deactivate()
// Attempt to initiate a connection, failing silently
connectEagerly()
// Attempt to add an asset per EIP-747
watchAsset()
// Reset the state of the connector without otherwise interacting with the connection
resetState()
```

### Activate

Activates the connector to either the default chain of the connector, or you can pass in a chainId (number) to connect to a certian chain. If the chain isn't configured in the connector, the user will be prompted to add the chain, given that you passed in the chains parameters to activate()

```ts

// Base activation, will connect to the default chain of the connector.
connector.activate()

// Will attempt to activate the connector on the given chain.
// If the chain isn't configured in the connector (eg: MetaMask wallet), it will go to the default.
// If the connector is already active, it will still change the chain.
connector.activate(137)

// You may also provide the chains configuration instead of the chainId. 
// This will allow the connector to add the chain if the connector isn't configured for the given chain.
// If the chain already exists, it will simply change to the chain.
const polygonConfiguration: AddEthereumChainParameter = {
    chainId: 137;
    chainName: 'Polygon';
    nativeCurrency: {
        name: 'Matic';
        symbol: 'MATIC';
        decimals: 18;
    };
    rpcUrls: [
      'https://polygon-rpc.com/',
      'https://rpc-mainnet.matic.network/',
      'https://rpc-mainnet.maticvigil.com/',
      'https://rpc-mainnet.matic.quiknode.pro/',
    ],
    blockExplorerUrls: ['https://polygonscan.com/'],
    iconUrls: [
      'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/polygon/info/logo.png'
    ],
}

connector.activate(polygonConfiguration)

```

### Connect Eagerly

Connecting eagerly is very similar to activate() except it won't throw any errors, since it knows it may not connect. It doesn't take in any params.

```ts
// Will attempt connect to default chain of the connector.
connector.connectEagerly()
```

### Watch Asset

You can easily add a token (ERC20 compliant) to the connector.

```ts

const assetToWatch: WatchAssetParameters = {
    // If chainId is provided the connector will switch to the correct chainId before adding the token
    // You may also pass the AddEthereumChainParameter config to the chainId prop incase the user
    // doesn't have the chain configured in their wallet. 
    // It will will add the chain, switch to the chain, then add the asset the user wants to watch.
    chainId: 137, // Optional
    address: '0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270',
    symbol: 'WMATIC',
    decimals: 18, 
    image: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/polygon/assets/0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270/logo.png'
}

// Adding WMATIC to the connector on chainId 137.
connector.watchAsset(assetToWatch)
```