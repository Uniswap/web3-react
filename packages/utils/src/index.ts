/**
 * CRITICAL FIX: Standardized chainId parsing to prevent bugs across connectors
 *
 * ISSUES FIXED:
 * 1. WalletConnect v1 was parsing without base parameter: parseInt("0x1") = NaN
 * 2. Some connectors handle number vs string differently
 * 3. No validation for invalid chainId values (NaN, negative, too large)
 *
 * This utility ensures ALL connectors parse chainId consistently and safely.
 */

/**
 * MAX_SAFE_CHAIN_ID is the upper bound limit on what will be accepted for `chainId`
 * `MAX_SAFE_CHAIN_ID = floor( ( 2**53 - 39 ) / 2 ) = 4503599627370476`
 *
 * @see {@link https://github.com/MetaMask/metamask-extension/blob/b6673731e2367e119a5fee9a454dd40bd4968948/shared/constants/network.js#L31}
 */
export const MAX_SAFE_CHAIN_ID = 4503599627370476

/**
 * Safely parse a chainId from string or number format
 *
 * @param chainId - The chainId as a hex string (e.g., "0x1") or number
 * @returns The chainId as a safe integer
 * @throws Error if chainId is invalid, NaN, negative, or exceeds MAX_SAFE_CHAIN_ID
 *
 * @example
 * parseChainId("0x1") // returns 1
 * parseChainId("0x89") // returns 137
 * parseChainId(1) // returns 1
 * parseChainId("invalid") // throws Error
 * parseChainId(-1) // throws Error
 */
export function parseChainId(chainId: string | number): number {
  let parsed: number

  if (typeof chainId === 'number') {
    parsed = chainId
  } else if (typeof chainId === 'string') {
    // Handle hex strings (0x prefix)
    if (chainId.startsWith('0x') || chainId.startsWith('0X')) {
      parsed = parseInt(chainId, 16)
    } else {
      // Handle decimal strings
      parsed = parseInt(chainId, 10)
    }
  } else {
    throw new Error(`Invalid chainId type: expected string or number, got ${typeof chainId}`)
  }

  // Validate the parsed value
  if (isNaN(parsed)) {
    throw new Error(`Invalid chainId: "${chainId}" could not be parsed to a number`)
  }

  if (!Number.isInteger(parsed)) {
    throw new Error(`Invalid chainId: ${parsed} is not an integer`)
  }

  if (parsed <= 0) {
    throw new Error(`Invalid chainId: ${parsed} must be positive`)
  }

  if (parsed > MAX_SAFE_CHAIN_ID) {
    throw new Error(`Invalid chainId: ${parsed} exceeds maximum safe value (${MAX_SAFE_CHAIN_ID})`)
  }

  return parsed
}

/**
 * Validate that an accounts array is not empty
 *
 * CRITICAL FIX: Prevents accessing accounts[0] when array is empty
 *
 * @param accounts - Array of account addresses
 * @returns The same array if valid
 * @throws Error if accounts is undefined, not an array, or empty
 */
export function validateAccounts(accounts: unknown): string[] {
  if (!Array.isArray(accounts)) {
    throw new Error(`Invalid accounts: expected array, got ${typeof accounts}`)
  }

  if (accounts.length === 0) {
    throw new Error('Invalid accounts: array is empty')
  }

  return accounts as string[]
}

/**
 * Safely get the first account from accounts array
 *
 * @param accounts - Array of accounts (may be undefined or empty)
 * @returns The first account or undefined
 */
export function getFirstAccount(accounts: string[] | undefined): string | undefined {
  return accounts && accounts.length > 0 ? accounts[0] : undefined
}

/**
 * Format chainId to hex string for RPC calls
 *
 * @param chainId - The chainId as a number
 * @returns The chainId as a hex string with 0x prefix
 *
 * @example
 * formatChainIdToHex(1) // returns "0x1"
 * formatChainIdToHex(137) // returns "0x89"
 */
export function formatChainIdToHex(chainId: number): string {
  if (!Number.isInteger(chainId) || chainId <= 0) {
    throw new Error(`Invalid chainId for hex formatting: ${chainId}`)
  }
  return `0x${chainId.toString(16)}`
}

/**
 * Known chain configurations for validation
 */
export const KNOWN_CHAINS: Record<number, { name: string; nativeCurrency: string }> = {
  1: { name: 'Ethereum Mainnet', nativeCurrency: 'ETH' },
  5: { name: 'Goerli', nativeCurrency: 'ETH' },
  11155111: { name: 'Sepolia', nativeCurrency: 'ETH' },
  10: { name: 'Optimism', nativeCurrency: 'ETH' },
  42161: { name: 'Arbitrum One', nativeCurrency: 'ETH' },
  137: { name: 'Polygon', nativeCurrency: 'MATIC' },
  80001: { name: 'Polygon Mumbai', nativeCurrency: 'MATIC' },
  56: { name: 'BNB Chain', nativeCurrency: 'BNB' },
  43114: { name: 'Avalanche C-Chain', nativeCurrency: 'AVAX' },
  250: { name: 'Fantom', nativeCurrency: 'FTM' },
  42220: { name: 'Celo', nativeCurrency: 'CELO' },
  1284: { name: 'Moonbeam', nativeCurrency: 'GLMR' },
  1285: { name: 'Moonriver', nativeCurrency: 'MOVR' },
  100: { name: 'Gnosis', nativeCurrency: 'xDAI' },
  8453: { name: 'Base', nativeCurrency: 'ETH' },
}

/**
 * Check if a chainId is a known/supported chain
 *
 * @param chainId - The chainId to check
 * @returns true if the chain is in the known chains list
 */
export function isKnownChain(chainId: number): boolean {
  return chainId in KNOWN_CHAINS
}

/**
 * Get chain information
 *
 * @param chainId - The chainId to get info for
 * @returns Chain info or undefined if unknown
 */
export function getChainInfo(chainId: number): { name: string; nativeCurrency: string } | undefined {
  return KNOWN_CHAINS[chainId]
}
