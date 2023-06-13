import { initializeConnector } from '@web3-react/core'
import { MagicAuthConnector } from '@web3-react/magic-auth'

export const [MagicAuth, hooks] = initializeConnector<MagicAuthConnector>((actions) => new MagicAuthConnector({ actions }))
