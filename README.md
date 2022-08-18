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
