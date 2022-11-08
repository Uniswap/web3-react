import { initializeConnector } from '@web3-react/core'
import { MagicConnect } from 'web3-react-magic-connect'
import type { MagicConnect as MagicConnectType } from 'web3-react-magic-connect'
import { URLS } from '../chains'

export const [magicConnect, magicConnectHooks] = initializeConnector<MagicConnectType>(
  (actions) =>
    new MagicConnect({
      actions,
      options: {
        apiKey: process.env.magicKey ? process.env.magicKey : 'pk_live_4EBA2B15E7EFCE26',
        networkOptions: {
          rpcUrl: URLS[1][0],
          chainId: 1,
        },
      },
    })
)
