# web3-react (beta)

[![CI](https://github.com/NoahZinsmeister/web3-react/actions/workflows/CI.yml/badge.svg?branch=main)](https://github.com/NoahZinsmeister/web3-react/actions/workflows/CI.yml)

## [Example](https://web3-react-mu.vercel.app/)

## Packages

| Package                                               | Version                                                                                                                                     | Size                                                                                                                                                           | Description                                 |
|-------------------------------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------|---------------------------------------------|
| [`@web3-react/types`](packages/types)                 | [![npm](https://img.shields.io/npm/v/@web3-react/types/beta.svg)](https://www.npmjs.com/package/@web3-react/types/v/beta)                 | [![minzip](https://img.shields.io/bundlephobia/minzip/@web3-react/types/beta.svg)](https://bundlephobia.com/result?p=@web3-react/types@beta)                 |                                             |
| [`@web3-react/store`](packages/store)                 | [![npm](https://img.shields.io/npm/v/@web3-react/store/beta.svg)](https://www.npmjs.com/package/@web3-react/store/v/beta)                 | [![minzip](https://img.shields.io/bundlephobia/minzip/@web3-react/store/beta.svg)](https://bundlephobia.com/result?p=@web3-react/store@beta)                 |                                             |
| [`@web3-react/core`](packages/core)                   | [![npm](https://img.shields.io/npm/v/@web3-react/core/beta.svg)](https://www.npmjs.com/package/@web3-react/core/v/beta)                   | [![minzip](https://img.shields.io/bundlephobia/minzip/@web3-react/core/beta.svg)](https://bundlephobia.com/result?p=@web3-react/core@beta)                   |                                             |
| **Connectors**                                        |                                                                                                                                             |                                                                                                                                                                |                                             |
| [`@web3-react/eip1193`](packages/eip1193)             | [![npm](https://img.shields.io/npm/v/@web3-react/eip1193/beta.svg)](https://www.npmjs.com/package/@web3-react/eip1193/v/beta)             | [![minzip](https://img.shields.io/bundlephobia/minzip/@web3-react/eip1193/beta.svg)](https://bundlephobia.com/result?p=@web3-react/eip1193@beta)             |                                             |
| [`@web3-react/empty`](packages/empty)                 | [![npm](https://img.shields.io/npm/v/@web3-react/empty/beta.svg)](https://www.npmjs.com/package/@web3-react/empty/v/beta)                 | [![minzip](https://img.shields.io/bundlephobia/minzip/@web3-react/empty/beta.svg)](https://bundlephobia.com/result?p=@web3-react/empty@beta)                 |                                             |
| [`@web3-react/metamask`](packages/metamask)           | [![npm](https://img.shields.io/npm/v/@web3-react/metamask/beta.svg)](https://www.npmjs.com/package/@web3-react/metamask/v/beta)           | [![minzip](https://img.shields.io/bundlephobia/minzip/@web3-react/metamask/beta.svg)](https://bundlephobia.com/result?p=@web3-react/metamask@beta)           | [MetaMask](https://metamask.io/)            |
| [`@web3-react/network`](packages/network)             | [![npm](https://img.shields.io/npm/v/@web3-react/network/beta.svg)](https://www.npmjs.com/package/@web3-react/network/v/beta)             | [![minzip](https://img.shields.io/bundlephobia/minzip/@web3-react/network/beta.svg)](https://bundlephobia.com/result?p=@web3-react/network@beta)             |                                             |
| [`@web3-react/url`](packages/url)                     | [![npm](https://img.shields.io/npm/v/@web3-react/url/beta.svg)](https://www.npmjs.com/package/@web3-react/url/v/beta)                     | [![minzip](https://img.shields.io/bundlephobia/minzip/@web3-react/url/beta.svg)](https://bundlephobia.com/result?p=@web3-react/url@beta)                     |                                             |
| [`@web3-react/walletconnect`](packages/walletconnect) | [![npm](https://img.shields.io/npm/v/@web3-react/walletconnect/beta.svg)](https://www.npmjs.com/package/@web3-react/walletconnect/v/beta) | [![minzip](https://img.shields.io/bundlephobia/minzip/@web3-react/walletconnect/beta.svg)](https://bundlephobia.com/result?p=@web3-react/walletconnect@beta) | [WalletConnect](https://walletconnect.org/) |
| [`@web3-react/walletlink`](packages/walletlink)       | [![npm](https://img.shields.io/npm/v/@web3-react/walletlink/beta.svg)](https://www.npmjs.com/package/@web3-react/walletlink/v/beta)       | [![minzip](https://img.shields.io/bundlephobia/minzip/@web3-react/walletlink/beta.svg)](https://bundlephobia.com/result?p=@web3-react/walletlink@beta)       | [WalletLink](https://walletlink.org/#/)     |
| **Experimental Connectors**                           |                                                                                                                                             |                                                                                                                                                                | Not stable                                  |
| [`@web3-react/frame`](packages/frame)                 | [![npm](https://img.shields.io/npm/v/@web3-react/frame/beta.svg)](https://www.npmjs.com/package/@web3-react/frame/v/beta)                 | [![minzip](https://img.shields.io/bundlephobia/minzip/@web3-react/frame/beta.svg)](https://bundlephobia.com/result?p=@web3-react/frame@beta)                 | [Frame](https://frame.sh/)                  |
| [`@web3-react/magic`](packages/magic)                 | [![npm](https://img.shields.io/npm/v/@web3-react/magic/beta.svg)](https://www.npmjs.com/package/@web3-react/magic/v/beta)                 | [![minzip](https://img.shields.io/bundlephobia/minzip/@web3-react/magic/beta.svg)](https://bundlephobia.com/result?p=@web3-react/magic@beta)                 | [Magic](https://magic.link/)                |


## Getting Started

- `yarn`
- `yarn bootstrap`
- `yarn start`

In addition to compiling each package in watch mode, this will also spin up the example app on [http://localhost:3000/](http://localhost:3000/).

## Running Tests

- `yarn test --watch`

## Documentation

This version of web3-react is still in beta, so unfortunately documentation is pretty sparse at the moment. The example repository and the source code itself are your best bets to get an idea of what's going on. More thorough documentation is a priority as development continues, however!

## Adding Connectors

If you're interested in using web3-react with a particular wallet solution that doesn't have an "official" connector package, you're in luck! This library was specifically written to be extremely modular, and you should be able to draw inspiration from the existing connectors to write your own! That code can live inside your codebase, or even be published as a standalone package. From time to time, if there's sufficient interest and desire, PRs adding new connectors may be accepted, but it's probably worth bringing up in an issue for discussion beforehand.

## Useful Commands

### Add a dependency

- `yarn lerna add <DEPENDENCY> --scope <PACKAGE>`

### Remove a dependency

- Delete the relevant `package.json` entry

Because of a [lerna bug](https://github.com/lerna/lerna/issues/1883), it's not possible to prune `yarn.lock` programmatically, so regenerate it manually:

- `yarn lerna exec "rm -f yarn.lock" --scope <SUBPACKAGE>`
- `yarn clean --scope <SUBPACKAGE>`
- `yarn bootstrap`
