Alchemy SDK for Javascript

The Alchemy SDK is the most comprehensive, stable, and powerful Javascript SDK available today to interact with the blockchain.

It supports the exact same syntax and functionality of the Ethers.js `AlchemyProvider` and `WebSocketProvider`, making it a 1:1 mapping for anyone using the Ethers.js `Provider`. However, it adds a significant amount of improved functionality on top of Ethers, such as easy access to Alchemy’s Enhanced and NFT APIs, robust WebSockets, and quality-of-life improvements such as automated retries.

The SDK leverages Alchemy's hardened node infrastructure, guaranteeing best-in-class node reliability, scalability, and data correctness, and is undergoing active development by Alchemy's engineers.

> 🙋‍♀️ **FEATURE REQUESTS:**
>
> We'd love your thoughts on what would improve your web3 dev process the most! If you have 5 minutes, tell us what you want on our [Feature Request feedback form](https://alchemyapi.typeform.com/sdk-feedback), and we'd love to build it for you.

The SDK currently supports the following chains:

- **Ethereum**: Mainnet, Goerli, Sepolia
- **Polygon**: Mainnet, Mumbai, Amoy
- **Optimism**: Mainnet, Goerli, Kovan, Sepolia
- **Arbitrum**: Mainnet, Goerli, Rinkeby, Sepolia
- **Astar**: Mainnet
- **PolygonZKEVM**: Mainnet, Testnet
- **Base**: Mainnet, Goerli, Sepolia
- **Zksync**: Mainnet, Sepolia

You can find per-method documentation of the Alchemy SDK endpoints at the [Alchemy Docs linked in the sidebar](https://docs.alchemy.com/reference/alchemy-sdk-quickstart).

## Getting started

```
npm install alchemy-sdk
```

After installing the app, you can then import and use the SDK:

```ts
import { Alchemy, Network } from 'alchemy-sdk';

// Optional config object, but defaults to the API key 'demo' and Network 'eth-mainnet'.
const settings = {
  apiKey: 'demo', // Replace with your Alchemy API key.
  network: Network.ETH_MAINNET // Replace with your network.
};

const alchemy = new Alchemy(settings);
```

> **ℹ️ Creating a unique Alchemy API Key**
>
> The public "demo" API key may be rate limited based on traffic. To create your own API key, **[sign up for an Alchemy account here](https://alchemy.com/?a=SDKquickstart)** and use the key created on your dashboard for the first app.

The `Alchemy` object returned by `new Alchemy()` provides access to the Alchemy API. An optional config object can be passed in when initializing to set your API key, change the network, or specify the max number of retries.

## Using the Alchemy SDK

The Alchemy SDK currently supports the following namespaces:

- `core`: All commonly-used Ethers.js Provider methods and Alchemy Enhanced API methods
- `nft`: All Alchemy NFT API methods
- `ws`: All WebSockets methods
- `transact`: All Alchemy Transaction API methods
- `notify`: CRUD endpoints for modifying Alchemy Notify Webhooks
- `debug`: Methods to inspect and replay transactions and blocks

If you are already using Ethers.js, you should be simply able to replace the Ethers.js Provider object with `alchemy.core` and it should work properly.

> **ℹ️ ENS Name Resolution**
>
> The Alchemy SDK now supports ENS names (e.g. `vitalik.eth`) for every parameter where you can pass in a Externally Owned Address, or user address (e.g. `0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045`).

```ts
import { Alchemy, AlchemySubscription } from 'alchemy-sdk';

// Using default settings - pass in a settings object to specify your API key and network
const alchemy = new Alchemy();

// Access standard Ethers.js JSON-RPC node request
alchemy.core.getBlockNumber().then(console.log);

// Access Alchemy Enhanced API requests
alchemy.core
  .getTokenBalances('0x3f5CE5FBFe3E9af3971dD833D26bA9b5C936f0bE')
  .then(console.log);

// Access the Alchemy NFT API
alchemy.nft.getNftsForOwner('vitalik.eth').then(console.log);

// Access WebSockets and Alchemy-specific WS methods
alchemy.ws.on(
  {
    method: AlchemySubscription.PENDING_TRANSACTIONS
  },
  res => console.log(res)
);
```

The Alchemy SDK also supports a number of Ethers.js objects that streamline the development process:

- [`Utils`](https://docs.ethers.io/v5/api/utils/): Equivalent to `ethers.utils`, this provides a number of common Ethers.js utility methods for developers.
  - [`Interface`](https://docs.ethers.io/v5/api/utils/abi/interface/): Found in `Utils.Interface`, this class abstracts the encoding and decoding required to interact with contracts on the Ethereum network.
- [`Contract`](https://docs.ethers.io/v5/api/contract/contract/): An abstraction for smart contract code deployed to the blockchain.
- [`ContractFactory`](https://docs.ethers.io/v5/api/contract/contract-factory/): Allows developers to build a `Contract` object.
- [`Wallet`](https://docs.ethers.io/v5/api/signer/#Wallet): An implementation of `Signer` that can sign transactions and messages using a private key as a standard Externally Owned Account.

## Alchemy Settings

An `AlchemySettings` object can be passed on instantiation to the Alchemy object, with the following optional parameters:

- `apiKey`: API key that can be found in the Alchemy dashboard. Defaults to `demo`: a rate-limited public key.
- `network`: Name of the network. Defaults to `Network.ETH_MAINNET`
- `maxRetries`: The maximum number of retries to attempt if a request fails. Defaults to 5.
- `url`: Optional URL endpoint to use for all requests. Setting this field will override the URL generated by the `network` and`apiKey` fields.
- `authToken`: Alchemy auth token required to use the Notify API. This token can be found in the Alchemy Dashboard on the Notify tab.
- `batchRequests`: Optional setting that automatically batches and sends json-rpc requests for higher throughput and reduced network IO. Defaults to false.
- `requestTimeout`: Optional setting that sets the timeout for requests in milliseconds for the NFT and Notify namespaces. Defaults to no timeout.

## Alchemy Core

The core namespace contains all commonly-used [Ethers.js Provider](https://docs.ethers.io/v5/api/providers/api-providers/#AlchemyProvider) methods. If you are already using Ethers.js, you should be simply able to replace the Ethers.js Provider object with `alchemy.core` when accessing provider methods and it should just work.

It also includes the majority of Alchemy Enhanced APIs, including:

- `getTokenMetadata()`: Get the metadata for a token contract address.
- `getTokenBalances()`: Gets the token balances for an owner given a list of contracts.
- `getAssetTransfers()`: Get transactions for specific addresses.
- `getTransactionReceipts()`: Gets all transaction receipts for a given block.

You will also find the following utility methods:

- `findContractDeployer()`: Find the contract deployer and block number for a given contract address.
- `getTokensForOwner()`: Get all token balances and metadata for a given owner address

### Accessing the full Ethers.js Provider

To keep the package clean, we don't support certain uncommonly-used Ethers.js Provider methods as top-level methods in the Alchemy `core` namespace - for example, `provider.formatter`. If you'd like to access these methods, simply use the `alchemy.config.getProvider()` function to configure the
Ethers.js Provider [AlchemyProvider](https://docs.ethers.io/v5/api/providers/api-providers/#AlchemyProvider) and return it.

```ts
import { Alchemy } from 'alchemy-sdk';

const alchemy = new Alchemy();

async function runAlchemy() {
  const ethersProvider = await alchemy.config.getProvider();
  console.log(ethersProvider.formatter);
}
runAlchemy();
```

## Alchemy WebSockets

In addition to the built-in Ethers.js listeners, the Alchemy SDK includes support for [Alchemy's Subscription API](https://docs.alchemy.com/alchemy/enhanced-apis/subscription-api-websockets). This allows you to subscribe to events and receive updates as they occur.

The `alchemy.ws` instance can be used like the standard Ethers.js [WebSocketProvider](https://docs.ethers.io/v5/api/providers/other/#WebSocketProvider) to add listeners for Alchemy events:

```ts
import { Alchemy, AlchemySubscription } from 'alchemy-sdk';

const alchemy = new Alchemy();

// Listen to all new pending transactions.
alchemy.ws.on('block', res => console.log(res));

// Listen to only the next transaction on the USDC contract.
alchemy.ws.once(
  {
    method: AlchemySubscription.PENDING_TRANSACTIONS,
    toAddress: 'vitalik.eth'
  },
  res => console.log(res)
);

// Remove all listeners.
alchemy.ws.removeAllListeners();
```

The SDK brings multiple improvements to ensure correct WebSocket behavior in cases of temporary network failure or
dropped connections. As with any network connection, you should not assume that a WebSocket will remain open forever
without interruption, but correctly handling dropped connections and reconnection by hand can be challenging to get
right. The Alchemy SDK automatically handles these failures with no configuration necessary. The main benefits are:

- Resilient event delivery: Unlike standard Web3.js or Ethers.js, you will not permanently miss events which arrive
  while the backing WebSocket is temporarily down. Instead, you will receive these events as soon as the connection
  is reopened. Note that if the connection is down for more than 120 blocks (approximately 20 minutes), you may
  still miss some events that were not part of the most recent 120 blocks.
- Lowered rate of failure: Compared to standard Web3.js or Ethers.js, there are fewer failures when sending requests
  over the WebSocket while the connection is down. The Alchemy SDK will attempt to send the requests once the connection
  is reopened. Note that it is still possible, with a lower likelihood, for outgoing requests to be lost,
  so you should still have error handling as with any network request.

## Alchemy Transact

The `transact` namespace contains methods used for simulating and sending transactions. The unique methods to the `transact` namespace are:

- `sendPrivateTransaction()`: Send a private transaction through Flashbots.
- `cancelPrivateTransaction()`: Cancel a private transaction sent with Flashbots.
- `simulateAssetChanges()`: Simulate a transaction and get a list of asset changes.
- `simulateExecution()`: Simulate a transaction and get a full list of internal transactions, logs, ABI decoded results and more.
- `simulateAssetChangesBundle()`: Simulate a list of transactions in sequence and get a list of asset changes.
- `simulateExecutionBundle()`: Simulate a list of transactions in sequence and get a full list of internal transactions, logs, ABI decoded results and more.

The `transact` namespace also aliases over several commonly used methods from the `core` namespace for convenience:

- `getTransaction()`: Returns the transaction for the given transaction hash.
- `sendTransaction()`: Sends a standard transaction to the network to be mined.
- `waitForTransaction()`: Waits for a transaction to be mined and returns the transaction receipt.

## Alchemy NFT API

The SDK currently supports the following [NFT API](https://docs.alchemy.com/alchemy/enhanced-apis/nft-api) endpoints
under the `alchemy.nft` namespace:

- `getNftMetadata()`: Get the NFT metadata for an NFT contract address and tokenId.
- `getNftMetadataBatch()`: Get the NFT metadata for multiple NFT contract addresses/token id pairs.
- `getContractMetadata()`: Get the metadata associated with an NFT contract
- `getContractMetadataBatch()`: Get the metadata associated with multiple NFT contracts in a single request.
- `getContractsForOwner()`: Get all NFT contracts that the provided owner address owns.
- `getNftsForOwner()`: Get NFTs for an owner address.
- `getNftsForOwnerIterator()`: Get NFTs for an owner address as an async iterator (handles paging automatically).
- `getNftsForContract()`: Get all NFTs for a contract address.
- `getNftsForContractIterator()`: Get all NFTs for a contract address as an async iterator (handles paging
  automatically).
- `getOwnersForNft()`: Get all the owners for a given NFT contract address and a particular token ID.
- `getOwnersForContract()`: Get all the owners for a given NFT contract address.
- `getMintedNfts()`: Get all the NFTs minted by the owner address.
- `getTransfersForOwner()`: Get all the NFT transfers for a given owner address.
- `getTransfersForContract()`: Get all the NFT transfers for a given NFT contract address.
- `verifyNftOwnership()`: Check whether the provided owner address owns the provided NFT contract addresses.
- `isSpamContract()`: Check whether the given NFT contract address is a spam contract as defined by Alchemy (see the [NFT API FAQ](https://docs.alchemy.com/alchemy/enhanced-apis/nft-api/nft-api-faq#nft-spam-classification))
- `getSpamContracts()`: Returns a list of all spam contracts marked by Alchemy.
- `reportSpam()`: Report feedback that a given NFT contract address is a spam contract as defined by Alchemy.
- `isAirdropNft()`: Check whether the given NFT token is marked as an airdrop or not. Airdrops are defined as NFTs that were minted to a user address in a transaction sent by a different address.
- `refreshNftMetadata()`: Refresh the cached NFT metadata for a contract address and a single tokenId.
- `refreshContract()`: Enqueues the specified contract address to have all token ids' metadata refreshed.
- `getFloorPrice()`: Return the floor prices of a NFT contract by marketplace.
- `computeRarity()`: Get the rarity of each attribute of an NFT.
- `getNftSales()`: Returns NFT sales that have happened through on-chain marketplaces.
- `summarizeNftAttributes()`: Get the summary of attribute prevalence for all NFTs in a contract.
- `searchContractMetadata()`: Search for a keyword across metadata of all ERC-721 and ERC-1155 smart contracts.

### Pagination

The Alchemy NFT endpoints return 100 results per page. To get the next page, you can pass in the `pageKey` returned by
the
previous call. To simplify paginating through all results, the SDK provides the `getNftsIterator()`
and `getNftsForContractIterator()` functions that automatically paginate through all NFTs and yields them via
an `AsyncIterable`.

Here's an example of how to paginate through all the NFTs in Vitalik's ENS address:

```ts
import { Alchemy } from 'alchemy-sdk';

const alchemy = new Alchemy();

async function main() {
  const ownerAddress = 'vitalik.eth';
  for await (const nft of alchemy.nft.getNftsForOwnerIterator(ownerAddress)) {
    console.log('ownedNft:', nft);
  }
}

main();
```

### SDK vs API Differences

The NFT API in the SDK standardizes response types to reduce developer friction, but note this results in some
differences compared to the Alchemy REST endpoints:

- Methods referencing `Collection` have been renamed to use the name `Contract` for greater accuracy: e.g. `getNftsForContract`.
- Some methods have different naming that the REST API counterparts in order to provide a consistent API interface (
  e.g. `getNftsForOwner()` is `alchemy_getNfts`, `getOwnersForNft()` is `alchemy_getOwnersForToken`).
- SDK standardizes to `omitMetadata` parameter (vs. `withMetadata`).
- Standardization to `pageKey` parameter for pagination (vs. `nextToken`/`startToken`)
- Empty `TokenUri` fields are omitted.
- Token ID is always normalized to an integer string on `BaseNft` and `Nft`.
- Some fields omitted in the REST response are included in the SDK response in order to return an `Nft` object.
- Some fields in the SDK's `Nft` object are named differently than the REST response.

## Alchemy Notify

The [Alchemy Notify API](https://docs.alchemy.com/reference/notify-api-quickstart) helps developers set up webhooks in their apps. The namespace provides methods to programmatically create, read, update, and delete your webhooks along with typings for the different webhooks. To learn more about Webhooks, please refer to the [Alchemy documentation](https://docs.alchemy.com/reference/notify-api-quickstart#what-are-webhooks).

Methods on the `NotifyNamespace` can be accessed via `alchemy.notify`. To use the methods, you must include your team's auth token in the `authToken` field of `AlchemySettings` when instantiating the SDK. The auth token can be found on the Alchemy Dashboard in the Notify Tab.

Methods include:

- `getAllWebhooks()`: Get all webhooks on your team.
- `getAddresses()`: Get all addresses tracked for the provided Address Activity Webhook.
- `getNftFilters()`: Get all NFT filters tracked for the provided NFT Activity Webhook.
- `createWebhook()`: Create a new webhook.
- `updateWebhook()`: Update an existing webhook's active status or tracked addresses and NFT filters.
- `deleteWebhook()`: Delete the provided webhook.

## Alchemy Debug

Methods on the `DebugNamespace` can be accessed via `alchemy.debug`. These methods are used for inspecting and debugging transactions.

Methods include:

- `traceCall()`: Run an `eth_call` with the context of the provided block execution using the final state of the parent block as the base.
- `traceTransaction()`: Run the transaction in the exact same manner as it was executed on the network. It will replay any transaction that may have been executed prior to this one before it and will then attempt to execute the transaction that corresponds to the given hash.
- `traceBlock()`: Replay a block that has already been mined.

## Documentation

The SDK is documented via `tsdoc` comments in the source code. The generated types and documentation are included when
using an IDE. To browse the documentation separately, you can view the generated API interfaces
in `etc/alchemy-sdk.api.md`. You can view generated Markdown files for each endpoint in the `docs-md` directory,
or as a webpage by opening `docs/index.html` in your browser.

## Usage Examples

Below are a few usage examples.

> **ℹ️ More Examples **
>
> You can also go here: [Examples Using the Alchemy SDK](https://docs.alchemy.com/reference/using-the-alchemy-sdk).

### Getting the NFTs owned by an address

```ts
import { Alchemy, NftExcludeFilters } from 'alchemy-sdk';

const alchemy = new Alchemy();

// Get how many NFTs an address owns.
alchemy.nft.getNftsForOwner('vitalik.eth').then(nfts => {
  console.log(nfts.totalCount);
});

// Get all the image urls for all the NFTs an address owns.
async function main() {
  for await (const nft of alchemy.nft.getNftsForOwnerIterator('vitalik.eth')) {
    console.log(nft.media);
  }
}

main();

// Filter out spam NFTs.
alchemy.nft
  .getNftsForOwner('vitalik.eth', {
    excludeFilters: [NftExcludeFilters.SPAM]
  })
  .then(console.log);
```

### Getting all the owners of the BAYC NFT

```ts
import { Alchemy } from 'alchemy-sdk';

const alchemy = new Alchemy();

// Bored Ape Yacht Club contract address.
const baycAddress = '0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D';

async function main() {
  for await (const nft of alchemy.nft.getNftsForContractIterator(baycAddress, {
    // Omit the NFT metadata for smaller payloads.
    omitMetadata: true
  })) {
    await alchemy.nft
      .getOwnersForNft(nft.contract.address, nft.tokenId)
      .then(response =>
        console.log('owners:', response.owners, 'tokenId:', nft.tokenId)
      );
  }
}

main();
```

### Get all outbound transfers for a provided address

```ts
import { Alchemy } from 'alchemy-sdk';

const alchemy = new Alchemy();

alchemy.core.getTokenBalances('vitalik.eth').then(console.log);
```

## Questions and Feedback

If you have any questions, issues, or feedback, please file an issue
on [GitHub](https://github.com/alchemyplatform/alchemy-sdk-js/issues), or drop us a message on
our [Discord](https://discord.com/channels/735965332958871634/983472322998575174) channel for the SDK.
