import { Eip1193Bridge } from '@ethersproject/experimental'
import { JsonRpcProvider } from '@ethersproject/providers'
import { initializeConnector } from '@web3-react/core'
import { EIP1193 } from '@web3-react/eip1193'
import { VoidSigner } from 'ethers'
import { URLS } from './network'

const ethersProvider = new JsonRpcProvider(URLS[1][0], 1)

const provider = new Eip1193Bridge(
  new VoidSigner('0x0000000000000000000000000000000000000000', ethersProvider),
  ethersProvider
)

export const [eip1993, hooks] = initializeConnector<EIP1193>((actions) => new EIP1193(actions, provider))
