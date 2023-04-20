import { getBestUrlMap, getChainsWithDefault } from './utils'

class MockHttpConnection {
  public readonly succeed: boolean
  public readonly latency: number

  constructor(url: string) {
    this.succeed = url.startsWith('succeed')
    this.latency = Number.parseInt(url.split('_')[1])
  }
}

class MockJsonRpcProvider {
  private readonly http: MockHttpConnection

  constructor(http: MockHttpConnection) {
    this.http = http
  }

  public async request() {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (this.http.succeed) {
          resolve(1)
        } else {
          reject()
        }
      }, this.http.latency)
    })
  }
}

jest.mock('@walletconnect/jsonrpc-http-connection', () => ({
  HttpConnection: MockHttpConnection,
}))
jest.mock('@walletconnect/jsonrpc-provider', () => ({
  JsonRpcProvider: MockJsonRpcProvider,
}))

describe('getBestUrl', () => {
  test('works with a single string', async () => {
    const rpc = await getBestUrlMap({ 0: 'succeed_0' }, 100)
    expect(rpc[0]).toBe('succeed_0')
  })

  test('works with 1 rpc (success)', async () => {
    const rpc = await getBestUrlMap({ 0: ['succeed_0'] }, 100)
    expect(rpc[0]).toBe('succeed_0')
  })

  test('works with 2 urls (success/failure)', async () => {
    const rpc = await getBestUrlMap({ 0: ['succeed_0', 'fail_0'] }, 100)
    expect(rpc[0]).toBe('succeed_0')
  })

  test('works with 2 urls (failure/success)', async () => {
    const rpc = await getBestUrlMap({ 0: ['fail_0', 'succeed_0'] }, 100)
    expect(rpc[0]).toBe('succeed_0')
  })

  test('works with 2 successful urls (fast/slow)', async () => {
    const rpc = await getBestUrlMap({ 0: ['succeed_0', 'succeed_1'] }, 100)
    expect(rpc[0]).toBe('succeed_0')
  })

  test('works with 2 successful urls (slow/fast)', async () => {
    const rpc = await getBestUrlMap({ 0: ['succeed_1', 'succeed_0'] }, 100)
    expect(rpc[0]).toBe('succeed_1')
  })

  test('works with 2 successful urls (after timeout/before timeout)', async () => {
    const rpc = await getBestUrlMap({ 0: ['succeed_100', 'succeed_0'] }, 50)
    expect(rpc[0]).toBe('succeed_0')
  })
})

describe('getChainsWithDefault', () => {
  test('puts the default chain first at the beginning', () => {
    expect(getChainsWithDefault([1, 2, 3], 3)).toEqual([3, 1, 2])
  })
})
