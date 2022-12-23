import { Connector, WatchAssetParameters } from '@web3-react/types'
import { CHAINS } from '../chains/chains'

export function WatchAsset({ connector, assetParams }: { connector: Connector; assetParams: WatchAssetParameters }) {
  const desiredChainId = assetParams?.desiredChainIdOrChainParameters
    ? typeof assetParams.desiredChainIdOrChainParameters === 'number'
      ? assetParams.desiredChainIdOrChainParameters
      : assetParams.desiredChainIdOrChainParameters?.chainId
    : undefined

  return (
    <button
      style={{ marginTop: '1em' }}
      onClick={() => {
        connector
          .watchAsset(assetParams)
          .then(() => {
            console.log(`Watching token ${assetParams.symbol}`)
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
