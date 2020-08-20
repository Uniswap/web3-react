# `web3-react` Documentation - Magic

- [Install](#install)
- [Arguments](#arguments)
- [Example](#example)

## Install

`yarn add @web3-react/magic-connector`

## Arguments

```typescript
apiKey: string
chainId: number
email: string
```

## Example

```javascript
import { MagicConnector } from '@web3-react/magic-connector'

const magic = new MagicConnector({ apiKey: '…', chainId: 4, email: '…' })
```

Note: Once the connector has been activated, the Magic SDK instance can be accessed under the `.magic` property.

## Errors

### UserRejectedRequestError

Happens when the user closes the connection window.

#### Example

```javascript
import { UserRejectedRequestError } from '@web3-react/magic-connector'

function Component() {
  const { error } = useWeb3React()
  const isNoEthereumProviderError = error instanceof UserRejectedRequestError
  // ...
}
```

### FailedVerificationError

Happens when the Magic link verification fails.

#### Example

```javascript
import { FailedVerificationError } from '@web3-react/magic-connector'

function Component() {
  const { error } = useWeb3React()
  const isNoEthereumProviderError = error instanceof FailedVerificationError
  // ...
}
```

### MagicLinkRateLimitError

Happens when the Magic rate limit has been reached.

#### Example

```javascript
import { MagicLinkRateLimitError } from '@web3-react/magic-connector'

function Component() {
  const { error } = useWeb3React()
  const isNoEthereumProviderError = error instanceof MagicLinkRateLimitError
  // ...
}
```

### MagicLinkExpiredError

Happens when the Magic link has expired.

#### Example

```javascript
import { MagicLinkExpiredError } from '@web3-react/magic-connector'

function Component() {
  const { error } = useWeb3React()
  const isNoEthereumProviderError = error instanceof MagicLinkExpiredError
  // ...
}
```
