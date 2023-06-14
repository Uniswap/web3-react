import { initializeConnector } from '@web3-react/core'
import { MagicConnect } from '@web3-react/magic-auth'

export const [MagicAuth, hooks] = initializeConnector<MagicConnect>(
  (actions) =>
    new MagicConnect({
      actions,
      options: {
        magicAuthApiKey: 'pk_live_846F1095F0E1303C',
        oAuthProvider: 'google',
        redirectURI: 'http://localhost:3000/',
        networkOptions: {
          rpcUrl: 'https://rpc-mainnet.maticvigil.com',
          chainId: 137,
        },
      },
    })
)
