import { Web3ReactHooks } from '@web3-react/core'
import { Connector, WatchAssetParameters } from '@web3-react/types'
import { CHAINS } from '../utils/chains'
import { Button } from './Button'

export function WatchAsset({
  watchingAsset,
  connector,
  assetParams,
}: {
  watchingAsset?: ReturnType<Web3ReactHooks['useWatchingAsset']>
  connector: Connector
  assetParams: WatchAssetParameters
}) {
  const desiredChainId = assetParams?.desiredChainIdOrChainParameters
    ? typeof assetParams.desiredChainIdOrChainParameters === 'number'
      ? assetParams.desiredChainIdOrChainParameters
      : assetParams.desiredChainIdOrChainParameters?.chainId
    : undefined

  return (
    <Button
      disabled={!!watchingAsset && watchingAsset.address === assetParams.address}
      style={{ marginTop: '1em' }}
      onClick={() => void connector.watchAsset(assetParams).catch((error) => console.log(error))}
    >
      {`Watch ${assetParams.symbol}${desiredChainId ? ` on ${CHAINS[desiredChainId]?.name}` : ''}`}
    </Button>
  )
}
