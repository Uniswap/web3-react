import { Web3ReactHooks } from '@web3-react/core'
import { Connector, WatchAssetParameters } from '@web3-react/types'
import { CHAINS } from '../chains/chains'

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
    <button
      disabled={!!watchingAsset && watchingAsset.address === assetParams.address}
      style={{ marginTop: '1em' }}
      onClick={() => {
        connector
          .watchAsset(assetParams)
          .then(() => {
            console.log(`Did watch token ${assetParams.symbol}`)
          })
          .catch(() => {
            console.log(`Failed watching token ${assetParams.symbol}`)
          })
      }}
    >
      {`Watch ${assetParams.symbol}${desiredChainId ? ` on ${CHAINS[desiredChainId]?.name}` : ''}`}
    </button>
  )
}
