import type { JsonRpcProvider } from '@ethersproject/providers'
import { getBestProvider } from './utils'

class MockJsonRpcProvider {
  public readonly succeed: boolean
  public readonly latency: number

  constructor(succeed: boolean, latency: number) {
    this.succeed = succeed
    this.latency = latency
  }

  public async getNetwork() {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (this.succeed) {
          resolve(1)
        } else {
          reject()
        }
      }, this.latency)
    })
  }
}

describe('getBestProvider', () => {
  test('works with 1 url (success)', async () => {
    const provider = new MockJsonRpcProvider(true, 0) as unknown as JsonRpcProvider
    const url = await getBestProvider([provider])
    expect(url === provider).toBe(true)
  })

  test('works with 1 url (failure)', async () => {
    const provider = new MockJsonRpcProvider(false, 0) as unknown as JsonRpcProvider
    const url = await getBestProvider([provider])
    expect(url === provider).toBe(true)
  })

  test('works with 2 urls (success/failure)', async () => {
    const providerSucceed = new MockJsonRpcProvider(true, 0) as unknown as JsonRpcProvider
    const providerFail = new MockJsonRpcProvider(false, 0) as unknown as JsonRpcProvider

    const url = await getBestProvider([providerSucceed, providerFail])
    expect(url === providerSucceed).toBe(true)
  })

  test('works with 2 urls (failure/success)', async () => {
    const providerFail = new MockJsonRpcProvider(false, 0) as unknown as JsonRpcProvider
    const providerSucceed = new MockJsonRpcProvider(true, 0) as unknown as JsonRpcProvider

    const url = await getBestProvider([providerFail, providerSucceed])
    expect(url === providerSucceed).toBe(true)
  })

  test('works with 2 successful urls (fast/slow)', async () => {
    const provider0 = new MockJsonRpcProvider(true, 0) as unknown as JsonRpcProvider
    const provider1 = new MockJsonRpcProvider(true, 1) as unknown as JsonRpcProvider

    const url = await getBestProvider([provider0, provider1])
    expect(url === provider0).toBe(true)
  })

  test('works with 2 successful urls (slow/fast)', async () => {
    const provider1 = new MockJsonRpcProvider(true, 1) as unknown as JsonRpcProvider
    const provider0 = new MockJsonRpcProvider(true, 0) as unknown as JsonRpcProvider

    const url = await getBestProvider([provider1, provider0])
    expect(url === provider1).toBe(true)
  })

  test('works with 2 successful urls (after timeout/before timeout)', async () => {
    const provider100 = new MockJsonRpcProvider(true, 100) as unknown as JsonRpcProvider
    const provider1 = new MockJsonRpcProvider(true, 1) as unknown as JsonRpcProvider

    const url = await getBestProvider([provider100, provider1], 50)
    expect(url === provider1).toBe(true)
  })
})
