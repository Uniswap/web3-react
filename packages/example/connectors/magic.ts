import { initializeConnector } from '@web3-react/core'
import { Magic } from '@web3-react/magic'

export const [magic, useMagic] = initializeConnector<Magic>(Magic, [
  {
    apiKey: 'pk_live_1F99B3C570C9B08F',
  },
])
