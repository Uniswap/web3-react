# `web3-react` Documentation - Injected Connector

- [Install](#install)
- [Arguments](#arguments)
- [Example](#example)
- [Errors](#errors)
  - [NoEthereumProviderError](#noethereumprovidererror)
    - [Example](#example-1)
  - [UserRejectedRequestError](#userrejectedrequesterror)
    - [Example](#example-2)

## Install
`yarn add @web3-react/injected-connector`

## Arguments
```typescript
interface InjectedConnectorArguments {
  supportedChainIds?: number[]
}
```

## Example
```javascript
import { InjectedConnector } from '@web3-react/injected-connector'

const injected = new InjectedConnector({ supportedChainIds: [1, 3, 4, 5, 42] })
```

## Errors

### NoEthereumProviderError

#### Example
```javascript
import { NoEthereumProviderError } from '@web3-react/injected-connector'
// ...

function Component () {
  const { error } = useWeb3React()
  const isNoEthereumProviderError = error instanceof NoEthereumProviderError
  // ...
}
```

### UserRejectedRequestError

#### Example
```javascript
import { UserRejectedRequestError } from '@web3-react/injected-connector'
// ...

function Component () {
  const { error } = useWeb3React()
  const isUserRejectedRequestError = error instanceof UserRejectedRequestError
  // ...
}
```
