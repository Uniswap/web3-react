# `web3-react` 🧰

_A simple, maximally extensible, dependency minimized framework for building modern [Ethereum dApps](https://ethereum.org/beginners/)_

[![lerna](https://img.shields.io/badge/maintained%20with-lerna-cc00ff.svg)](https://lerna.js.org/)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)

[![Actions Status](https://github.com/NoahZinsmeister/web3-react/workflows/CI/badge.svg)](https://github.com/NoahZinsmeister/web3-react/actions)

| Packages                              | `@latest` Version                                                                                                                                                         | Size                                                                                                                                                                                 | Description                                                                         |
| ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------- |
| 🏠 **Core**                           |
| `@web3-react/core`                    | [![npm version](https://img.shields.io/npm/v/@web3-react/core/latest.svg)](https://www.npmjs.com/package/@web3-react/core/v/latest)                                       | [![minzip](https://img.shields.io/bundlephobia/minzip/@web3-react/core/latest.svg)](https://bundlephobia.com/result?p=@web3-react/core@latest)                                       | [React](https://reactjs.org/) Interface                                             |
| 🔌 **Connectors**                     |
| _Browser Extension/dApp Browser_      |
| `@web3-react/injected-connector`      | [![npm version](https://img.shields.io/npm/v/@web3-react/injected-connector/latest.svg)](https://www.npmjs.com/package/@web3-react/injected-connector/v/latest)           | [![minzip](https://img.shields.io/bundlephobia/minzip/@web3-react/injected-connector/latest.svg)](https://bundlephobia.com/result?p=@web3-react/injected-connector@latest)           | [Injected](https://github.com/ethereum/EIPs/blob/master/EIPS/eip-1193.md) Connector |
| _Remote API_                          |
| `@web3-react/network-connector`       | [![npm version](https://img.shields.io/npm/v/@web3-react/network-connector/latest.svg)](https://www.npmjs.com/package/@web3-react/network-connector/v/latest)             | [![minzip](https://img.shields.io/bundlephobia/minzip/@web3-react/network-connector/latest.svg)](https://bundlephobia.com/result?p=@web3-react/network-connector@latest)             | [RPC](https://github.com/ethereum/wiki/wiki/JSON-RPC) Connector                     |
| _QR Code_                             |
| `@web3-react/walletconnect-connector` | [![npm version](https://img.shields.io/npm/v/@web3-react/walletconnect-connector/latest.svg)](https://www.npmjs.com/package/@web3-react/walletconnect-connector/v/latest) | [![minzip](https://img.shields.io/bundlephobia/minzip/@web3-react/walletconnect-connector/latest.svg)](https://bundlephobia.com/result?p=@web3-react/walletconnect-connector@latest) | [WalletConnect](https://walletconnect.org/) Connector                               |
| `@web3-react/walletlink-connector`    | [![npm version](https://img.shields.io/npm/v/@web3-react/walletlink-connector/latest.svg)](https://www.npmjs.com/package/@web3-react/walletlink-connector/v/latest)       | [![minzip](https://img.shields.io/bundlephobia/minzip/@web3-react/walletlink-connector/latest.svg)](https://bundlephobia.com/result?p=@web3-react/walletlink-connector@latest)       | [WalletLink](https://www.walletlink.org/#/) Connector                               |
| _Hardware_                            |
| `@web3-react/ledger-connector`        | [![npm version](https://img.shields.io/npm/v/@web3-react/ledger-connector/latest.svg)](https://www.npmjs.com/package/@web3-react/ledger-connector/v/latest)               | [![minzip](https://img.shields.io/bundlephobia/minzip/@web3-react/ledger-connector/latest.svg)](https://bundlephobia.com/result?p=@web3-react/ledger-connector@latest)               | [Ledger](https://www.ledger.com/) Connector                                         |
| `@web3-react/trezor-connector`        | [![npm version](https://img.shields.io/npm/v/@web3-react/trezor-connector/latest.svg)](https://www.npmjs.com/package/@web3-react/trezor-connector/v/latest)               | [![minzip](https://img.shields.io/bundlephobia/minzip/@web3-react/trezor-connector/latest.svg)](https://bundlephobia.com/result?p=@web3-react/trezor-connector@latest)               | [Trezor](https://trezor.io/) Connector                                              |
| `@web3-react/lattice-connector`        | [![npm version](https://img.shields.io/npm/v/@web3-react/lattice-connector/latest.svg)](https://www.npmjs.com/package/@web3-react/lattice-connector/v/latest)               | [![minzip](https://img.shields.io/bundlephobia/minzip/@web3-react/lattice-connector/latest.svg)](https://bundlephobia.com/result?p=@web3-react/lattice-connector@latest)               | [Lattice](https://gridplus.io/) Connector                                              |
| _Native_                              |
| `@web3-react/frame-connector`         | [![npm version](https://img.shields.io/npm/v/@web3-react/frame-connector/latest.svg)](https://www.npmjs.com/package/@web3-react/frame-connector/v/latest)                 | [![minzip](https://img.shields.io/bundlephobia/minzip/@web3-react/frame-connector/latest.svg)](https://bundlephobia.com/result?p=@web3-react/frame-connector@latest)                 | [Frame](https://frame.sh/) Connector                                                |
| _Hosted_                              |
| `@web3-react/authereum-connector`     | [![npm version](https://img.shields.io/npm/v/@web3-react/authereum-connector/latest.svg)](https://www.npmjs.com/package/@web3-react/authereum-connector/v/latest)         | [![minzip](https://img.shields.io/bundlephobia/minzip/@web3-react/authereum-connector/latest.svg)](https://bundlephobia.com/result?p=@web3-react/authereum-connector@latest)         | [Authereum](https://authereum.org/) Connector                                       |
| `@web3-react/fortmatic-connector`     | [![npm version](https://img.shields.io/npm/v/@web3-react/fortmatic-connector/latest.svg)](https://www.npmjs.com/package/@web3-react/fortmatic-connector/v/latest)         | [![minzip](https://img.shields.io/bundlephobia/minzip/@web3-react/fortmatic-connector/latest.svg)](https://bundlephobia.com/result?p=@web3-react/fortmatic-connector@latest)         | [Fortmatic](https://fortmatic.com/) Connector                                       |
| `@web3-react/portis-connector`        | [![npm version](https://img.shields.io/npm/v/@web3-react/portis-connector/latest.svg)](https://www.npmjs.com/package/@web3-react/portis-connector/v/latest)               | [![minzip](https://img.shields.io/bundlephobia/minzip/@web3-react/portis-connector/latest.svg)](https://bundlephobia.com/result?p=@web3-react/portis-connector@latest)               | [Portis](https://www.portis.io/) Connector                                          |
| `@web3-react/squarelink-connector`    | [![npm version](https://img.shields.io/npm/v/@web3-react/squarelink-connector/latest.svg)](https://www.npmjs.com/package/@web3-react/squarelink-connector/v/latest)       | [![minzip](https://img.shields.io/bundlephobia/minzip/@web3-react/squarelink-connector/latest.svg)](https://bundlephobia.com/result?p=@web3-react/squarelink-connector@latest)       | [Squarelink](https://squarelink.com/) Connector                                     |
| `@web3-react/torus-connector`         | [![npm version](https://img.shields.io/npm/v/@web3-react/torus-connector/latest.svg)](https://www.npmjs.com/package/@web3-react/torus-connector/v/latest)                 | [![minzip](https://img.shields.io/bundlephobia/minzip/@web3-react/torus-connector/latest.svg)](https://bundlephobia.com/result?p=@web3-react/torus-connector@latest)                 | [Torus](https://tor.us/) Connector                                                  |
| 🐉 **Low-Level**                      |
| `@web3-react/abstract-connector`      | [![npm version](https://img.shields.io/npm/v/@web3-react/abstract-connector/latest.svg)](https://www.npmjs.com/package/@web3-react/abstract-connector/v/latest)           | [![minzip](https://img.shields.io/bundlephobia/minzip/@web3-react/abstract-connector/latest.svg)](https://bundlephobia.com/result?p=@web3-react/abstract-connector@latest)           | Shared Connector Class                                                              |
| `@web3-react/types`                   | [![npm version](https://img.shields.io/npm/v/@web3-react/types/latest.svg)](https://www.npmjs.com/package/@web3-react/types/v/latest)                                     | [![minzip](https://img.shields.io/bundlephobia/minzip/@web3-react/types/latest.svg)](https://bundlephobia.com/result?p=@web3-react/types@latest)                                     | Shared [TypeScript](https://www.typescriptlang.org/) Types                          |

## Quickstart

[![Edit web3-react-example](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/github/NoahZinsmeister/web3-react/tree/v6/example?fontsize=14&hidenavigation=1&theme=dark)

## [Documentation](docs)

## Projects using `web3-react`

_Open a PR to add your project to the list!_

- [Uniswap.exchange](https://github.com/Uniswap/uniswap-frontend)
- [hypertext.finance](https://github.com/NoahZinsmeister/hypertext)
- [useWallet](https://github.com/aragon/use-wallet)
- [Terminal](https://blog.terminal.co/web3-react-integration/)
- [Everest](https://github.com/metacartel/everest-web-app)
- [NFT Scribe](https://github.com/conlan/nft-scribe)
- [Compound Liquidator](https://github.com/conlan/compound-liquidator)
- [wildcards.world](https://github.com/wildcards-world/ui)
- [Outpost](https://github.com/OutpostProtocol/outpost-app)
- [Async Art](https://async.art)
- [Union](https://union.finance)
- [Aave](https://app.aave.com)
- [Eth2 Launchpad](https://launchpad.ethereum.org/)


## Related Efforts

- [Web3Modal](https://github.com/web3modal/web3modal)

## Local Development

- Clone repo\
  `git clone https://github.com/NoahZinsmeister/web3-react.git`

- Install top-level dependencies\
  `yarn`

- Install sub-dependencies\
  `yarn bootstrap`

- Build and watch for changes\
  `yarn start`
