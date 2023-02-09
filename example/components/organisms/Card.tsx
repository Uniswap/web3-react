import type { ReactNode } from 'react'
import type { Web3ReactHooks } from '@web3-react/core'
import type { Connector } from '@web3-react/types'
import type { StaticImageData } from 'next/image'
import AccountsView from '../molecules/AccountsView'
import StatusView from '../molecules/StatusView'
import NetworkView from '../molecules/NetworkView'
import ChainView from '../molecules/ChainView'
import BlockNumberView from '../molecules/BlockNumberView'
import ConnectWithSelectView from '../molecules/ConnectWithSelectView'
import WatchAssetView from '../molecules/WatchAssetView'
import SpacerView from '../atoms/SpacerView'
import SelectionView from '../molecules/SelectionView'
import ConnectorTitleView from '../molecules/ConnectorTitleView'

interface Props {
  connector: Connector
  chainId: ReturnType<Web3ReactHooks['useChainId']>
  accountIndex?: ReturnType<Web3ReactHooks['useAccountIndex']>
  isActivating: ReturnType<Web3ReactHooks['useIsActivating']>
  isActive: ReturnType<Web3ReactHooks['useIsActive']>
  error: Error | undefined
  setError: (error: Error | undefined) => void
  ENSNames?: ReturnType<Web3ReactHooks['useENSNames']>
  ENSAvatars?: ReturnType<Web3ReactHooks['useENSAvatars']>
  provider?: ReturnType<Web3ReactHooks['useProvider']>
  addingChain?: ReturnType<Web3ReactHooks['useAddingChain']>
  switchingChain?: ReturnType<Web3ReactHooks['useSwitchingChain']>
  watchingAsset?: ReturnType<Web3ReactHooks['useWatchingAsset']>
  accounts?: string[]
  walletLogoUrl?: string | StaticImageData
  hide?: boolean
  children?: ReactNode
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
  provider,
  accounts,
  addingChain,
  switchingChain,
  watchingAsset,
  walletLogoUrl,
  hide,
  children,
}: Props) {
  return (
    <div
      style={{
        display: hide ? 'none' : 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-start',
        padding: '1rem',
        margin: '1rem',
        overflow: 'hidden',
        border: '1px solid',
        borderRadius: '1rem',
        borderColor: '#30363d',
        backgroundColor: 'rgb(14,16,22)',
      }}
    >
      <ConnectorTitleView connector={connector} walletLogoUrl={walletLogoUrl} />
      <StatusView
        connector={connector}
        accounts={accounts}
        accountIndex={accountIndex}
        isActivating={isActivating}
        isActive={isActive}
        error={error}
      />
      <SelectionView connector={connector} />
      <NetworkView chainId={chainId} addingChain={addingChain} switchingChain={switchingChain} />
      <ChainView connector={connector} chainId={chainId} addingChain={addingChain} switchingChain={switchingChain} />
      <BlockNumberView connector={connector} provider={provider} chainId={chainId} />
      <AccountsView
        connector={connector}
        provider={provider}
        accountIndex={accountIndex}
        accounts={accounts}
        chainId={chainId}
        ENSNames={ENSNames}
        ENSAvatars={ENSAvatars}
      />
      <ConnectWithSelectView
        connector={connector}
        chainId={chainId}
        isActivating={isActivating}
        isActive={isActive}
        error={error}
        setError={setError}
        addingChain={addingChain}
        switchingChain={switchingChain}
      />
      {isActive && <WatchAssetView connector={connector} chainId={chainId} watchingAsset={watchingAsset} />}
      {children && (
        <>
          <SpacerView />
          {children}
        </>
      )}
    </div>
  )
}
