# @web3-react/connection-monitor

## Overview

A robust connection health monitoring system for web3-react connectors that provides:

- **Automatic health checks** - Periodic verification that providers are still responsive
- **Stale connection detection** - Identifies when a connection has gone bad without explicit disconnect
- **Request deduplication** - Prevents duplicate concurrent requests to the same method
- **Graceful degradation** - Automatic reconnection attempts with exponential backoff
- **Memory leak prevention** - Proper cleanup of timers and event listeners

## Installation

```bash
yarn add @web3-react/connection-monitor
```

## Usage

```typescript
import { useConnectionMonitor } from '@web3-react/connection-monitor'
import { useWeb3React } from '@web3-react/core'

function MyComponent() {
  const { connector, provider } = useWeb3React()
  
  const { isHealthy, lastChecked, reconnect } = useConnectionMonitor(connector, provider, {
    checkInterval: 30000, // Check every 30 seconds
    timeout: 5000, // 5 second timeout for health checks
    maxRetries: 3, // Maximum reconnection attempts
    onStale: () => console.warn('Connection went stale'),
    onRecover: () => console.log('Connection recovered')
  })

  return (
    <div>
      <p>Connection: {isHealthy ? '✅ Healthy' : '❌ Unhealthy'}</p>
      <p>Last checked: {lastChecked?.toLocaleTimeString()}</p>
      {!isHealthy && <button onClick={reconnect}>Reconnect</button>}
    </div>
  )
}
```

## API

### `useConnectionMonitor(connector, provider, options)`

**Parameters:**

- `connector`: The web3-react connector to monitor
- `provider`: The provider instance (optional, will use connector.provider if not provided)
- `options`: Configuration options

**Options:**

- `checkInterval` (number): Milliseconds between health checks (default: 30000)
- `timeout` (number): Health check timeout in milliseconds (default: 5000)
- `maxRetries` (number): Maximum automatic reconnection attempts (default: 3)
- `enabled` (boolean): Enable/disable monitoring (default: true)
- `onStale` (callback): Called when connection becomes stale
- `onRecover` (callback): Called when connection recovers
- `onError` (callback): Called on health check errors

**Returns:**

- `isHealthy` (boolean): Current connection health status
- `lastChecked` (Date | null): Timestamp of last health check
- `consecutiveFailures` (number): Count of consecutive failed checks
- `reconnect` (function): Manual reconnection trigger
- `reset` (function): Reset failure counter

## How It Works

1. **Periodic Health Checks**: Sends `eth_chainId` requests to verify provider responsiveness
2. **Stale Detection**: Monitors for connections that appear active but don't respond
3. **Smart Recovery**: Exponential backoff for reconnection attempts
4. **Resource Cleanup**: Automatically cleans up timers when component unmounts

## Benefits

- Prevents user frustration from silent connection failures
- Reduces support tickets from "stuck" connections
- Improves overall application reliability
- Zero-config with sensible defaults
