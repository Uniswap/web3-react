import { CoinbaseWallet } from '@web3-react/coinbase-wallet'
import { Web3ReactHooks } from '@web3-react/core'
import { GnosisSafe } from '@web3-react/gnosis-safe'
import { MetaMask } from '@web3-react/metamask'
import { Network } from '@web3-react/network'
import { WalletConnect } from '@web3-react/walletconnect'
import { polygonMainChainId } from '../chains/chainIds'
import { CHAINS, getAddChainParameters } from '../chains/chains'
import { getImageUrlFromTrust } from '../chains/helpers'
import { getName } from '../utils'
import { Accounts } from './Accounts'
import { Chain } from './Chain'
import { ConnectWithSelect } from './ConnectWithSelect'
import { Status } from './Status'
import { WatchAsset } from './WatchAsset'

interface Props {
  connector: MetaMask | WalletConnect | CoinbaseWallet | Network | GnosisSafe
  chainId: ReturnType<Web3ReactHooks['useChainId']>
  isActivating: ReturnType<Web3ReactHooks['useIsActivating']>
  isActive: ReturnType<Web3ReactHooks['useIsActive']>
  error: Error | undefined
  setError: (error: Error | undefined) => void
  ENSNames: ReturnType<Web3ReactHooks['useENSNames']>
  provider?: ReturnType<Web3ReactHooks['useProvider']>
  addingChain?: ReturnType<Web3ReactHooks['useAddingChain']>
  switchingChain?: ReturnType<Web3ReactHooks['useSwitchingChain']>
  watchingAsset?: ReturnType<Web3ReactHooks['useWatchingAsset']>
  accounts?: string[]
  isPriority?: boolean
  isSelected?: boolean
}

export function Card({
  connector,
  chainId,
  isActivating,
  isActive,
  error,
  setError,
  ENSNames,
  accounts,
  provider,
  addingChain,
  switchingChain,
  watchingAsset,
  isPriority,
  isSelected,
}: Props) {
  const chainConfig = chainId ? CHAINS[chainId] : undefined
  const { nativeWrappedToken: wrappedMatic } = CHAINS[polygonMainChainId]

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        width: '20rem',
        padding: '1rem',
        margin: '1rem',
        overflow: 'auto',
        border: '1px solid',
        borderRadius: '1rem',
      }}
    >
      <b>{getName(connector)}</b>
      <div style={{ marginBottom: '1rem' }}>
        <Status isActivating={isActivating} isActive={isActive} error={error} />
      </div>
      <div>
        Priority: <b>{isPriority ? 'true' : 'false'}</b>
      </div>
      <div>
        Selected: <b>{isSelected ? 'true' : 'false'}</b>
      </div>
      <Chain chainId={chainId} addingChain={addingChain} switchingChain={switchingChain} />
      <div style={{ marginBottom: '1rem' }}>
        <Accounts accounts={accounts} provider={provider} ENSNames={ENSNames} />
      </div>
      <ConnectWithSelect
        connector={connector}
        chainId={chainId}
        isActivating={isActivating}
        isActive={isActive}
        error={error}
        setError={setError}
        isSelected={isSelected}
      />
      {connector?.watchAsset && (
        <>
          <b style={{ marginTop: '1rem' }}>Watch Asset</b>
          {chainConfig && chainId !== polygonMainChainId && (
            <WatchAsset
              watchingAsset={watchingAsset}
              connector={connector}
              assetParams={{
                desiredChainIdOrChainParameters: getAddChainParameters(chainConfig?.chainId),
                image: getImageUrlFromTrust(chainId, chainConfig?.nativeWrappedToken?.address),
                ...chainConfig?.nativeWrappedToken,
              }}
            />
          )}
          <WatchAsset
            watchingAsset={watchingAsset}
            connector={connector}
            assetParams={{
              desiredChainIdOrChainParameters: getAddChainParameters(polygonMainChainId),
              image: getImageUrlFromTrust(polygonMainChainId, wrappedMatic.address),
              ...wrappedMatic,
            }}
          />
        </>
      )}
    </div>
  )
}
