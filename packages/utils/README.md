# @web3-react/utils

## Critical Bug Fixes

This package provides standardized utilities to fix critical bugs across web3-react connectors.

### Fixed Issues

#### 1. **Inconsistent ChainId Parsing** (CRITICAL BUG)

**Problem**: Different connectors parsed chainId differently:

- WalletConnect v1: `parseInt(chainId)` without base parameter → `parseInt("0x1")` = `NaN`
- Others: `parseInt(chainId, 16)` → Correct parsing

**Impact**: WalletConnect connections would fail with NaN chainId, breaking the entire app.

**Fix**: `parseChainId()` function handles all cases consistently:

```typescript
parseChainId("0x1")  // ✅ Returns 1
parseChainId("0x89") // ✅ Returns 137  
parseChainId(1)      // ✅ Returns 1
parseChainId("invalid") // ❌ Throws descriptive error
```

#### 2. **No Empty Array Validation** (CRITICAL BUG)

**Problem**: Code assumed `accounts[0]` was always safe, but wallets can return empty arrays.

**Impact**: `undefined` account values caused silent failures.

**Fix**: `validateAccounts()` and `getFirstAccount()` functions:

```typescript
validateAccounts([])  // ❌ Throws before accessing [0]
getFirstAccount([])   // ✅ Returns undefined safely
```

#### 3. **No NaN/Invalid ChainId Detection** (CRITICAL BUG)

**Problem**: Invalid chainId values (NaN, negative, too large) were not caught early.

**Impact**: Cascading failures throughout the app.

**Fix**: Comprehensive validation in `parseChainId()`:

- Checks for NaN
- Validates positive integer
- Enforces MAX_SAFE_CHAIN_ID limit

## API

### `parseChainId(chainId: string | number): number`

Safely parse chainId from any format with full validation.

### `validateAccounts(accounts: unknown): string[]`

Validate accounts array is non-empty before use.

### `getFirstAccount(accounts: string[] | undefined): string | undefined`

Safely get first account without array access errors.

### `formatChainIdToHex(chainId: number): string`

Convert chainId to hex format for RPC calls.

### `isKnownChain(chainId: number): boolean`

Check if chainId is a known network.

### `getChainInfo(chainId: number): {...} | undefined`

Get metadata for known chains.

## Usage

```typescript
import { parseChainId } from '@web3-react/utils'

// In connectors
const chainId = parseChainId(receivedChainId) // Always safe!
```

## Migration

Connectors should migrate from individual `parseChainId` functions to this shared utility to ensure consistent behavior.
