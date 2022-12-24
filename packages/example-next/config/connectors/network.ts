import { initializeConnector } from '@web3-react/core'
import { Network } from '@web3-react/network'
import { URLS } from '../../utils/chains'

export const [network, hooks] = initializeConnector<Network>((actions) => new Network({ actions, urlMap: URLS }))
