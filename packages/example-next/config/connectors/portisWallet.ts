import type { Web3ReactHooks } from '@web3-react/core'
import type { Web3ReactStore } from '@web3-react/types'
import { initializeConnector } from '@web3-react/core'
import { PortisWallet } from '@web3-react/portis-wallet'

export const [portisWallet, hooks]: [PortisWallet, Web3ReactHooks, Web3ReactStore] = initializeConnector<PortisWallet>(
  (actions) =>
    new PortisWallet({
      actions,
      options: {
        dappId: 'a5f43357-0729-4dc5-8a06-3a69dea1f351',
        network: 'mainnet',
      },
    })
)
