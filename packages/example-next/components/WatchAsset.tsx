import { Connector, WatchAssetParameters } from '@web3-react/types'

export function WatchAsset({ connector, assetParams }: { connector: Connector; assetParams: WatchAssetParameters }) {
  return (
    <button
      style={{ marginTop: '1em' }}
      onClick={() => {
        connector
          .watchAsset(assetParams)
          .then(() => {
            console.log(`Added token ${assetParams.symbol}`)
          })
          .catch(() => {
            console.log(`Failed adding token ${assetParams.symbol}`)
          })
      }}
    >
      {`Watch ${assetParams.symbol}${assetParams?.chainId ? ` on chain ${assetParams.chainId}` : ''}`}
    </button>
  )
}
