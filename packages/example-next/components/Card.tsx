import { CoinbaseWallet } from '@web3-react/coinbase-wallet'
import { Web3ReactHooks } from '@web3-react/core'
import { GnosisSafe } from '@web3-react/gnosis-safe'
import { MetaMask } from '@web3-react/metamask'
import { Network } from '@web3-react/network'
import { WalletConnect } from '@web3-react/walletconnect'
import { polygonMainChainId } from '../config/chains/chainIds'
import { CHAINS, getAddChainParameters } from '../utils/chains'
import { getImageUrlFromTrust } from '../utils/helpers'
import { getName } from '../utils/connectors'
import { Accounts } from './Accounts'
import { Chain } from './Chain'
import { ConnectWithSelect } from './ConnectWithSelect'
import { Status } from './Status'
import { WatchAsset } from './WatchAsset'
import Spacer from './Spacer'

interface Props {
  connector: MetaMask | WalletConnect | CoinbaseWallet | Network | GnosisSafe
  chainId: ReturnType<Web3ReactHooks['useChainId']>
  accountIndex?: ReturnType<Web3ReactHooks['useAccountIndex']>
  isActivating: ReturnType<Web3ReactHooks['useIsActivating']>
  isActive: ReturnType<Web3ReactHooks['useIsActive']>
  error: Error | undefined
  setError: (error: Error | undefined) => void
  ENSNames: ReturnType<Web3ReactHooks['useENSNames']>
  ENSAvatars: ReturnType<Web3ReactHooks['useENSAvatars']>
  provider?: ReturnType<Web3ReactHooks['useProvider']>
  addingChain?: ReturnType<Web3ReactHooks['useAddingChain']>
  switchingChain?: ReturnType<Web3ReactHooks['useSwitchingChain']>
  watchingAsset?: ReturnType<Web3ReactHooks['useWatchingAsset']>
  accounts?: string[]
  isPriority?: boolean
  isSelected?: boolean
  walletLogo?: string
}

export function Card({
  connector,
  chainId,
  accountIndex,
  isActivating,
  isActive,
  error,
  setError,
  ENSNames,
  ENSAvatars,
  accounts,
  provider,
  addingChain,
  switchingChain,
  watchingAsset,
  isPriority,
  isSelected,
  walletLogo,
}: Props) {
  const chainConfig = chainId ? CHAINS[chainId] : undefined
  const { nativeWrappedToken: wrappedMatic } = CHAINS[polygonMainChainId]

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-start',
        width: '20rem',
        padding: '1rem',
        margin: '1rem',
        overflow: 'hidden',
        border: '1px solid',
        borderRadius: '1rem',
        borderColor: '#30363d',
        backgroundColor: 'rgb(14,16,22)',
      }}
    >
      <div
        style={{
          display: 'inline-flex',
          justifyContent: 'flex-start',
          alignItems: 'center',
          overflow: 'hidden',
          maxWidth: '100%',
        }}
      >
        {walletLogo && (
          <img
            src={walletLogo}
            style={{
              width: 24,
              height: 24,
              marginRight: '8px',
              borderRadius: '50%',
              overflow: 'hidden',
              backgroundColor: 'red',
            }}
          />
        )}
        <b>{getName(connector)}</b>
      </div>
      <div style={{ marginBottom: '1rem' }}>
        <Status isActivating={isActivating} isActive={isActive} error={error} />
      </div>
      <div style={{ whiteSpace: 'pre' }}>
        Priority: <b style={{ fontSize: '0.875em' }}>{isPriority ? ' ✅' : ' ❌'}</b>
      </div>
      <div style={{ whiteSpace: 'pre' }}>
        Selected: <b style={{ fontSize: '0.875em' }}>{isSelected ? ' ✅' : ' ❌'}</b>
      </div>
      <Chain chainId={chainId} addingChain={addingChain} switchingChain={switchingChain} />
      <Accounts
        accountIndex={accountIndex}
        accounts={accounts}
        provider={provider}
        ENSNames={ENSNames}
        ENSAvatars={ENSAvatars}
      />
      <ConnectWithSelect
        connector={connector}
        chainId={chainId}
        isActivating={isActivating}
        isActive={isActive}
        error={error}
        setError={setError}
        isSelected={isSelected}
        addingChain={addingChain}
        switchingChain={switchingChain}
      />
      {connector?.watchAsset && (
        <>
          <Spacer />
          <b>Watch Asset</b>
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
