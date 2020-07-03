# `web3-react` Documentation - Provided

- [Install](#install)
- [Arguments](#arguments)
- [Example](#example)
- [Errors](#errors)
  - [NoEthereumProviderError](#noethereumprovidererror)
    - [Example](#example-1)
  - [UserRejectedRequestError](#userrejectedrequesterror)
    - [Example](#example-2)

## Install
`yarn add @web3-react/provided-connector`

## Arguments
```typescript
provider?: Ethereum
supportedChainIds?: number[]
```

## Example
```javascript
import { ProvidedConnector } from '@web3-react/provided-connector'

const provided = new ProvidedConnector({ provider = window.ethereum, supportedChainIds: [1, 3, 4, 5, 42] })
```

## Errors

### NoEthereumProviderError

#### Example
```javascript
import { NoEthereumProviderError } from '@web3-react/provided-connector'

function Component () {
  const { error } = useWeb3React()
  const isNoEthereumProviderError = error instanceof NoEthereumProviderError
  // ...
}
```

### UserRejectedRequestError

#### Example
```javascript
import { UserRejectedRequestError } from '@web3-react/provided-connector'

function Component () {
  const { error } = useWeb3React()
  const isUserRejectedRequestError = error instanceof UserRejectedRequestError
  // ...
}
```
