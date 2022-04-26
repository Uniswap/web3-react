/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import { TorusConnector } from '@web3-react/torus'
import { initializeConnector } from '@web3-react/core'
import { URLS } from '../chains'

export const [torusConnector, hooks] = initializeConnector<TorusConnector>((actions) => {
  return new TorusConnector(actions, {
    chainId: 80001,
    initOptions: {
      network: {
        host: URLS[80001][0],
        chainId: 80001,
        networkName: 'Mumbai',
      },
    },
  })
})
