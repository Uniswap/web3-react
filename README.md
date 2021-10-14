# `web3-react` 🧰

[![CI](https://github.com/NoahZinsmeister/web3-react/actions/workflows/CI.yml/badge.svg?branch=main)](https://github.com/NoahZinsmeister/web3-react/actions/workflows/CI.yml)

[Example](https://web3-react-mu.vercel.app/)

Warning: alpha code!

Tasks:
- Write other connectors
  - WalletConnect V2
  - Gnosis Safe
  - Other injected connectors?
- Tighten up experimental connectors
- Address remaining TODOs in the code
- More tests
- Ensure dist/ files can be consumed in e.g. CRA
- Docs
- Test Node 12 support
- Add Node 16 support once LTS

## Packages

| Package                                               | `@alpha` Version                                                                                                                            | Size                                                                                                                                                           | Description                                 |
| ----------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------- |
| [`@web3-react/store`](packages/store)                 | [![npm](https://img.shields.io/npm/v/@web3-react/store/alpha.svg)](https://www.npmjs.com/package/@web3-react/store/v/alpha)                 | [![minzip](https://img.shields.io/bundlephobia/minzip/@web3-react/store/alpha.svg)](https://bundlephobia.com/result?p=@web3-react/store@alpha)                 |                                             |
| [`@web3-react/types`](packages/types)                 | [![npm](https://img.shields.io/npm/v/@web3-react/types/alpha.svg)](https://www.npmjs.com/package/@web3-react/types/v/alpha)                 | [![minzip](https://img.shields.io/bundlephobia/minzip/@web3-react/types/alpha.svg)](https://bundlephobia.com/result?p=@web3-react/types@alpha)                 |                                             |
| [`@web3-react/core`](packages/core)                   | [![npm](https://img.shields.io/npm/v/@web3-react/core/alpha.svg)](https://www.npmjs.com/package/@web3-react/core/v/alpha)                   | [![minzip](https://img.shields.io/bundlephobia/minzip/@web3-react/core/alpha.svg)](https://bundlephobia.com/result?p=@web3-react/core@alpha)                   |                                             |
| **Connectors**                                        |                                                                                                                                             |                                                                                                                                                                |                                             |
| [`@web3-react/metamask`](packages/metamask)           | [![npm](https://img.shields.io/npm/v/@web3-react/metamask/alpha.svg)](https://www.npmjs.com/package/@web3-react/metamask/v/alpha)           | [![minzip](https://img.shields.io/bundlephobia/minzip/@web3-react/metamask/alpha.svg)](https://bundlephobia.com/result?p=@web3-react/metamask@alpha)           | [MetaMask](https://metamask.io/)            |
| [`@web3-react/network`](packages/network)             | [![npm](https://img.shields.io/npm/v/@web3-react/network/alpha.svg)](https://www.npmjs.com/package/@web3-react/network/v/alpha)             | [![minzip](https://img.shields.io/bundlephobia/minzip/@web3-react/network/alpha.svg)](https://bundlephobia.com/result?p=@web3-react/network@alpha)             |                                             |
| [`@web3-react/walletconnect`](packages/walletconnect) | [![npm](https://img.shields.io/npm/v/@web3-react/walletconnect/alpha.svg)](https://www.npmjs.com/package/@web3-react/walletconnect/v/alpha) | [![minzip](https://img.shields.io/bundlephobia/minzip/@web3-react/walletconnect/alpha.svg)](https://bundlephobia.com/result?p=@web3-react/walletconnect@alpha) | [WalletConnect](https://walletconnect.org/) |
| [`@web3-react/walletlink`](packages/walletlink)       | [![npm](https://img.shields.io/npm/v/@web3-react/walletlink/alpha.svg)](https://www.npmjs.com/package/@web3-react/walletlink/v/alpha)       | [![minzip](https://img.shields.io/bundlephobia/minzip/@web3-react/walletlink/alpha.svg)](https://bundlephobia.com/result?p=@web3-react/walletlink@alpha)       | [WalletLink](https://walletlink.org/#/)     |
| **Experimental Connectors**                           |                                                                                                                                             |                                                                                                                                                                | ⚠️ Not stable                                |
| [`@web3-react/frame`](packages/frame)                 | [![npm](https://img.shields.io/npm/v/@web3-react/frame/alpha.svg)](https://www.npmjs.com/package/@web3-react/frame/v/alpha)                 | [![minzip](https://img.shields.io/bundlephobia/minzip/@web3-react/frame/alpha.svg)](https://bundlephobia.com/result?p=@web3-react/frame@alpha)                 | [Frame](https://frame.sh/)                  |
| [`@web3-react/magic`](packages/magic)                 | [![npm](https://img.shields.io/npm/v/@web3-react/magic/alpha.svg)](https://www.npmjs.com/package/@web3-react/magic/v/alpha)                 | [![minzip](https://img.shields.io/bundlephobia/minzip/@web3-react/magic/alpha.svg)](https://bundlephobia.com/result?p=@web3-react/magic@alpha)                 | [Magic](https://magic.link/)                |


## Getting Started

- `yarn`
- `yarn bootstrap`
- `yarn start`

In addition to compiling each package in watch mode, this will also spin up an example app on [http://localhost:3000/](http://localhost:3000/).

## Running Tests

- `yarn test --watch`

## Useful Commands

### Add a dependency

- `yarn lerna add <DEPENDENCY> --scope <SUBPACKAGE>`

### Remove a dependency

- Delete the relevant `package.json` entry

Because of a [lerna bug](https://github.com/lerna/lerna/issues/1883), it's not possible to prune `yarn.lock` programmatically, so regenerate it manually:

- `yarn lerna exec 'rm -f yarn.lock' --scope SUBPACKAGE`
- `yarn clean --scope SUBPACKAGE`
- `yarn bootstrap`
