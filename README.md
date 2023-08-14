# web3-react (beta)

[![CI](https://github.com/Uniswap/web3-react/actions/workflows/CI.yml/badge.svg)](https://github.com/Uniswap/web3-react/actions/workflows/CI.yml)

_Looking for the prior version of this library? It's available on the [v6 branch](https://github.com/Uniswap/web3-react/tree/v6)._

## [Example](https://web3-react-mu.vercel.app/)

This is a hosted version of [example](/example).

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
| [`@web3-react/walletconnect-v2`](packages/walletconnect-v2)     | [![npm](https://img.shields.io/npm/v/@web3-react/walletconnect-v2/beta.svg)](https://www.npmjs.com/package/@web3-react/walletconnect-v2/v/beta)     | [![minzip](https://img.shields.io/bundlephobia/minzip/@web3-react/walletconnect-v2/beta.svg)](https://bundlephobia.com/result?p=@web3-react/walletconnect-v2@beta)     | [WalletConnect](https://walletconnect.org/)                               |
| [`@web3-react/coinbase-wallet`](packages/coinbase-wallet) | [![npm](https://img.shields.io/npm/v/@web3-react/coinbase-wallet/beta.svg)](https://www.npmjs.com/package/@web3-react/coinbase-wallet/v/beta) | [![minzip](https://img.shields.io/bundlephobia/minzip/@web3-react/coinbase-wallet/beta.svg)](https://bundlephobia.com/result?p=@web3-react/coinbase-wallet@beta) | [Coinbase Wallet](https://docs.cloud.coinbase.com/wallet-sdk/docs)        |
| [`@web3-react-trust-wallet`](https://github.com/trustwallet/web3-react-trust-wallet) | [![npm](https://img.shields.io/npm/v/@trustwallet/web3-react-trust-wallet)](https://www.npmjs.com/package/@trustwallet/web3-react-trust-wallet) | [![minzip](https://img.shields.io/bundlephobia/minzip/@trustwallet/web3-react-trust-wallet)](https://bundlephobia.com/package/@trustwallet/web3-react-trust-wallet) | [Trust Wallet](https://trustwallet.com/)        |
| [`@avalabs/web3-react-core-connector`](https://github.com/ava-labs/avalanche-dapp-sdks/tree/alpha-release/packages/web3-react-core-connector) | [![npm](https://img.shields.io/npm/v/@avalabs/web3-react-core-connector)](https://www.npmjs.com/package/@avalabs/web3-react-core-connector) | [![minzip](https://img.shields.io/bundlephobia/minzip/@avalabs/web3-react-core-connector)](https://bundlephobia.com/package/@avalabs/web3-react-core-connector) | [Core Wallet](https://extension.core.app/)        |
| [`@venly/web3-react-venly`](https://github.com/ArkaneNetwork/web3-react-venly) | [![npm](https://img.shields.io/npm/v/@venly/web3-react-venly)](https://www.npmjs.com/package/@venly/web3-react-venly) | [![minzip](https://img.shields.io/bundlephobia/minzip/@venly/web3-react-venly)](https://bundlephobia.com/package/@venly/web3-react-venly) | [Venly](https://www.venly.io/)        |

## Get Started

- `yarn`
- `yarn start`

In addition to compiling each package in watch mode, this will also spin up [/example](/example) on [localhost:3000](http://localhost:3000/).

## Run Tests

- `yarn build`
- `yarn test --watch`

## Publish

- `yarn lerna publish [--dist-tag] `

## Documentation

This version of web3-react is still in beta, so unfortunately documentation is pretty sparse at the moment. [/example](/example), TSDoc comments, and the source code itself are the best ways to get an idea of what's going on. More thorough documentation is a priority as development continues!

## Upgrading Connector Dependencies

Some connectors have one or more dependencies that are specific to the connection method in question. For example, the walletconnect connector relies on `@walletconnect/ethereum-provider` package to handle a lot of the connection logic. Often, you may wish to upgrade to the latest version of a client package, to take advantage of the latest features. web3-react makes the process of upgrading client packages fairly painless by specifying them as [`peerDependencies`](https://docs.npmjs.com/cli/v8/configuring-npm/package-json#peerdependencies). This means that you have to explicitly install client packages, and therefore may transparently switch between any version that agrees with the semver specified in the connector (usually any matching major).

## Third-Party Connectors

The decision to publish a connector under the @web3-react namespace is fully up to the discretion of the team. However, third-party connectors are always welcome! This library was designed to be highly modular, and you should be able to draw inspiration from the existing connectors to write your own. That connector can live inside your codebase, or even be published as a standalone package. A selection of third-party connectors that have widespread usage may be featured below, PRs modifying this list are welcome.

## Upgrading from v6

While the internals of web3-react have changed fairly dramatically between v6 and v8, the hope is that usage don't have to change too much when upgrading. Once you've migrated to the new connectors and state management patterns, you should be able to use the hooks defined in @web3-react/core, in particular `useWeb3React` (or `usePriorityWeb3React`), as more or less drop-in replacements for the v6 hooks. The big benefit in v8 is that hooks are now per-connector, as opposed to global, so no more juggling between connectors/multiple roots!
