import { Eip1193Bridge } from '@ethersproject/experimental'
import { JsonRpcProvider } from '@ethersproject/providers'
import { initializeConnector } from '@web3-react/core'
import { EIP1193 } from '@web3-react/eip1193'
import { URLS } from '../chains'

class Eip1193BridgeWithoutAccounts extends Eip1193Bridge {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  request(request: { method: string; params?: any[] }): Promise<any> {
    if (request.method === 'eth_requestAccounts' || request.method === 'eth_accounts') return Promise.resolve([])
    return super.request(request)
  }
}

const ethersProvider = new JsonRpcProvider(URLS[1][0], 1)
const eip1193Provider = new Eip1193BridgeWithoutAccounts(ethersProvider.getSigner(), ethersProvider)

export const [eip1193, hooks] = initializeConnector<EIP1193>((actions) => new EIP1193(actions, eip1193Provider), [1])
