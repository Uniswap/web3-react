import { arrayify } from '@ethersproject/bytes'
import { keccak256 } from '@ethersproject/keccak256'
import invariant from 'tiny-invariant'

export function normalizeChainId(chainId: string | number): number {
  if (typeof chainId === 'string') {
    // Temporary fix until the next version of Metamask Mobile gets released.
    // In the current version (0.2.13), the chainId starts with “Ox” rather
    // than “0x”. Fix: https://github.com/MetaMask/metamask-mobile/pull/1275
    chainId = chainId.replace(/^Ox/, '0x')

    const parsedChainId = Number.parseInt(chainId, chainId.trim().substring(0, 2) === '0x' ? 16 : 10)
    invariant(!Number.isNaN(parsedChainId), `chainId ${chainId} is not an integer`)
    return parsedChainId
  } else {
    invariant(Number.isInteger(chainId), `chainId ${chainId} is not an integer`)
    return chainId
  }
}

// https://github.com/ethers-io/ethers.js/blob/d9d438a119bb11f8516fc9cf02c534ab3816fcb3/packages/address/src.ts/index.ts
export function normalizeAccount(_address: string): string {
  invariant(typeof _address === 'string' && _address.match(/^(0x)?[0-9a-fA-F]{40}$/), `Invalid address ${_address}`)

  const address = _address.substring(0, 2) === '0x' ? _address : `0x${_address}`
  const chars = address
    .toLowerCase()
    .substring(2)
    .split('')

  const charsArray = new Uint8Array(40)
  for (let i = 0; i < 40; i++) {
    charsArray[i] = chars[i].charCodeAt(0)
  }
  const hashed = arrayify(keccak256(charsArray))

  for (let i = 0; i < 40; i += 2) {
    if (hashed[i >> 1] >> 4 >= 8) {
      chars[i] = chars[i].toUpperCase()
    }
    if ((hashed[i >> 1] & 0x0f) >= 8) {
      chars[i + 1] = chars[i + 1].toUpperCase()
    }
  }

  const addressChecksum = `0x${chars.join('')}`

  invariant(
    !(address.match(/([A-F].*[a-f])|([a-f].*[A-F])/) && address !== addressChecksum),
    `Bad address checksum ${address} ${addressChecksum}`
  )

  return addressChecksum
}
