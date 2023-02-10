import type { Web3ReactHooks } from '@web3-react/core'
import type { Connector } from '@web3-react/types'

import { isCardanoConnector, isSolanaConnector, isTronConnector } from '../../../utils/connectors'

export default function ChainView({
  connector,
  chainId,
  addingChain,
  switchingChain,
}: {
  connector: Connector
  chainId?: ReturnType<Web3ReactHooks['useChainId']>
  addingChain?: ReturnType<Web3ReactHooks['useAddingChain']>
  switchingChain?: ReturnType<Web3ReactHooks['useSwitchingChain']>
}) {
  if (
    chainId === undefined ||
    isCardanoConnector(connector) ||
    isSolanaConnector(connector) ||
    isTronConnector(connector)
  )
    return null

  const prefix = addingChain ? 'Adding ' : switchingChain ? 'Switching ' : ''

  const getText = () => {
    if (addingChain) {
      return addingChain.chainId
    }

    if (switchingChain) {
      return `${switchingChain.fromChainId ?? ''} to ${switchingChain.toChainId ?? ''}`
    }

    return chainId
  }

  return (
    <div style={{ marginTop: 4 }}>
      {`${prefix}Chain: `}
      <b>{getText()}</b>
    </div>
  )
}
