# `web3-react` Documentation - Connectors

Connectors are stand-alone packages that interface with `web3-react` and manage connections to a single type of Ethereum node or wallet. To give an example: it's quite common for dApp users to rely on browser extensions such as [MetaMask](https://metamask.io/) to manage their account for them. So, `web3-react` defines a connector that's responsible for interfacing with browser extensions. The current list of first-party `web3-react` connectors can be found in the [top-level README.md](../../).

One enormous benefit to `web3-react` is that it's incredibly easy to extend existing/create new connectors! They're very simple Javascript class objects which simply need to define a few functions to be fully compatible with the rest of `web3-react`.

For more information on specific first-party connectors, see the individual files in this folder.
