import { getBestUrl } from './utils'

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
  test('works with 1 url (success)', async () => {
    const url = await getBestUrl(['succeed_0'], 100)
    expect(url).toBe('succeed_0')
  })

  test('works with 1 url (failure)', async () => {
    const url = await getBestUrl(['fail_0'], 100)
    expect(url).toBe('fail_0')
  })

  test('works with 2 urls (success/failure)', async () => {
    const url = await getBestUrl(['succeed_0', 'fail_0'], 100)
    expect(url).toBe('succeed_0')
  })

  test('works with 2 urls (failure/success)', async () => {
    const url = await getBestUrl(['fail_0', 'succeed_0'], 100)
    expect(url).toBe('succeed_0')
  })

  test('works with 2 successful urls (fast/slow)', async () => {
    const url = await getBestUrl(['succeed_0', 'succeed_1'], 100)
    expect(url).toBe('succeed_0')
  })

  test('works with 2 successful urls (slow/fast)', async () => {
    const url = await getBestUrl(['succeed_1', 'succeed_0'], 100)
    expect(url).toBe('succeed_1')
  })

  test('works with 2 successful urls (after timeout/before timeout)', async () => {
    const url = await getBestUrl(['succeed_100', 'succeed_0'], 50)
    expect(url).toBe('succeed_0')
  })
})
