import { Connector, WatchAssetParameters } from '@web3-react/types'

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
            console.log(`Added token ${assetParams.symbol}`)
          })
          .catch((err) => {
            console.log(`Failed adding token ${assetParams.symbol}`)
          })
      }}
    >
      {`Watch ${assetParams.symbol}${desiredChainId ? ` on chain ${desiredChainId}` : ''}`}
    </button>
  )
}
