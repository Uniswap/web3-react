import type { Web3ReactHooks } from '@web3-react/core'
import type { Connector } from '@web3-react/types'
import { useBlockNumber } from '../../hooks/web3Hooks'
import CircleLoader from '../atoms/CircleLoader'

export default function BlockNumberView({
  connector,
  provider,
  chainId,
}: {
  connector: Connector
  provider?: ReturnType<Web3ReactHooks['useProvider']>
  chainId?: ReturnType<Web3ReactHooks['useChainId']>
}) {
  const { blockNumber, isLoading } = useBlockNumber(connector, provider, chainId, false)

  if (chainId === undefined || connector === undefined || (!isLoading && !blockNumber)) return null

  return (
    <div
      style={{ height: 18, marginTop: 4, display: 'inline-flex', alignItems: 'center', justifyContent: 'flex-start' }}
    >
      <p style={{ marginRight: 8 }}>Block:</p>
      {blockNumber && !isLoading ? <b>{blockNumber}</b> : <CircleLoader />}
    </div>
  )
}
