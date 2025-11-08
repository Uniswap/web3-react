import {
  parseChainId,
  validateAccounts,
  getFirstAccount,
  formatChainIdToHex,
  isKnownChain,
  getChainInfo,
  MAX_SAFE_CHAIN_ID,
} from './index'

describe('parseChainId', () => {
  test('parses hex string with 0x prefix', () => {
    expect(parseChainId('0x1')).toBe(1)
    expect(parseChainId('0x89')).toBe(137)
    expect(parseChainId('0xa4b1')).toBe(42161) // Arbitrum
  })

  test('parses hex string with 0X prefix', () => {
    expect(parseChainId('0X1')).toBe(1)
    expect(parseChainId('0XA')).toBe(10)
  })

  test('parses decimal string', () => {
    expect(parseChainId('1')).toBe(1)
    expect(parseChainId('137')).toBe(137)
  })

  test('handles number input', () => {
    expect(parseChainId(1)).toBe(1)
    expect(parseChainId(137)).toBe(137)
  })

  test('throws on invalid string', () => {
    expect(() => parseChainId('invalid')).toThrow('could not be parsed to a number')
    expect(() => parseChainId('0xinvalid')).toThrow('could not be parsed to a number')
  })

  test('throws on negative chainId', () => {
    expect(() => parseChainId(-1)).toThrow('must be positive')
    expect(() => parseChainId('-1')).toThrow('must be positive')
  })

  test('throws on zero chainId', () => {
    expect(() => parseChainId(0)).toThrow('must be positive')
  })

  test('throws on chainId exceeding MAX_SAFE_CHAIN_ID', () => {
    expect(() => parseChainId(MAX_SAFE_CHAIN_ID + 1)).toThrow('exceeds maximum safe value')
  })

  test('throws on non-integer chainId', () => {
    expect(() => parseChainId(1.5)).toThrow('not an integer')
  })

  test('handles edge cases for WalletConnect v1 bug', () => {
    // This was the bug: parseInt("0x1") without base returns NaN
    // Our fix ensures it parses correctly
    expect(parseChainId('0x1')).toBe(1)
    expect(parseChainId('0xa')).toBe(10)
  })
})

describe('validateAccounts', () => {
  test('validates non-empty array', () => {
    const accounts = ['0x123', '0x456']
    expect(validateAccounts(accounts)).toEqual(accounts)
  })

  test('throws on empty array', () => {
    expect(() => validateAccounts([])).toThrow('array is empty')
  })

  test('throws on non-array', () => {
    expect(() => validateAccounts('not an array')).toThrow('expected array')
    expect(() => validateAccounts(null)).toThrow('expected array')
    expect(() => validateAccounts(undefined)).toThrow('expected array')
  })
})

describe('getFirstAccount', () => {
  test('returns first account from array', () => {
    expect(getFirstAccount(['0x123', '0x456'])).toBe('0x123')
  })

  test('returns undefined for empty array', () => {
    expect(getFirstAccount([])).toBeUndefined()
  })

  test('returns undefined for undefined', () => {
    expect(getFirstAccount(undefined)).toBeUndefined()
  })
})

describe('formatChainIdToHex', () => {
  test('formats number to hex string', () => {
    expect(formatChainIdToHex(1)).toBe('0x1')
    expect(formatChainIdToHex(137)).toBe('0x89')
    expect(formatChainIdToHex(42161)).toBe('0xa4b1')
  })

  test('throws on invalid chainId', () => {
    expect(() => formatChainIdToHex(0)).toThrow('Invalid chainId')
    expect(() => formatChainIdToHex(-1)).toThrow('Invalid chainId')
    expect(() => formatChainIdToHex(1.5)).toThrow('Invalid chainId')
  })
})

describe('isKnownChain', () => {
  test('returns true for known chains', () => {
    expect(isKnownChain(1)).toBe(true) // Ethereum
    expect(isKnownChain(137)).toBe(true) // Polygon
    expect(isKnownChain(42161)).toBe(true) // Arbitrum
  })

  test('returns false for unknown chains', () => {
    expect(isKnownChain(999999)).toBe(false)
  })
})

describe('getChainInfo', () => {
  test('returns chain info for known chains', () => {
    expect(getChainInfo(1)).toEqual({ name: 'Ethereum Mainnet', nativeCurrency: 'ETH' })
    expect(getChainInfo(137)).toEqual({ name: 'Polygon', nativeCurrency: 'MATIC' })
  })

  test('returns undefined for unknown chains', () => {
    expect(getChainInfo(999999)).toBeUndefined()
  })
})
