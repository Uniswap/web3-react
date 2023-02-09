import type { Web3ReactHooks } from '@web3-react/core'
import type { Connector } from '@web3-react/types'

import { polygonMainChainId } from '../../config/chains/chainIds'
import { ChainConfig } from '../../config/chains/chains.interface'
import { CHAINS, getAddChainParameters } from '../../utils/chains'
import { isEVMConnector } from '../../utils/connectors'
import { getImageUrlFromTrust } from '../../utils/helpers'
import SpacerView from '../atoms/SpacerView'
import { WatchAssetButton } from './WatchAssetButton'

export default function WatchAssetView({
  connector,
  chainId,
  watchingAsset,
}: {
  connector: Connector
  chainId: ReturnType<Web3ReactHooks['useChainId']>
  watchingAsset?: ReturnType<Web3ReactHooks['useWatchingAsset']>
}) {
  const chainConfig = chainId ? CHAINS[chainId] : undefined
  const { nativeWrappedToken: wrappedMatic } = CHAINS[polygonMainChainId]
  return (
    connector?.watchAsset && (
      <>
        <SpacerView />
        <b>Watch Asset</b>
        {chainConfig &&
          chainId !== polygonMainChainId &&
          CHAINS[chainId] &&
          !!(CHAINS[chainId] as ChainConfig)?.nativeWrappedToken && (
            <WatchAssetButton
              watchingAsset={watchingAsset}
              connector={connector}
              assetParams={{
                desiredChainIdOrChainParameters: getAddChainParameters(chainConfig?.chainId),
                image: getImageUrlFromTrust(chainId, chainConfig?.nativeWrappedToken?.address),
                ...chainConfig?.nativeWrappedToken,
              }}
            />
          )}
        {isEVMConnector(connector) && (
          <WatchAssetButton
            watchingAsset={watchingAsset}
            connector={connector}
            assetParams={{
              desiredChainIdOrChainParameters: getAddChainParameters(polygonMainChainId),
              image: getImageUrlFromTrust(polygonMainChainId, wrappedMatic.address),
              ...wrappedMatic,
            }}
          />
        )}
      </>
    )
  )
}
