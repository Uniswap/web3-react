import { useWeb3React } from '@web3-react/core'

import { network } from '../../../config/connectors/network'
import { getName } from '../../../utils/connectors'
import Button from '../../controls/Button'
import AccountsView from '../displayViews/AccountsView'
import BlockNumberView from '../displayViews/BlockNumberView'
import ChainView from '../displayViews/ChainView'
import NetworkView from '../displayViews/NetworkView'
import SignerButton from '../displayViews/SignerButton'
import SpacerView from '../displayViews/SpacerView'
import StatusView from '../displayViews/StatusView'

export default function SelectedConnectorCard({ hide }: { hide: boolean }) {
  const {
    connector,
    chainId,
    accountIndex,
    accounts,
    ENSNames,
    ENSAvatars,
    provider,
    isActivating,
    isActive,
    setSelectedConnector,
    addingChain,
    switchingChain,
    hooks: { usePriorityConnector },
  } = useWeb3React()

  const account = (accounts?.[accountIndex] as string) ?? undefined
  const priorityConnector = usePriorityConnector()
  const isPriority = priorityConnector === connector
  const priorityConnectorName = getName(priorityConnector)

  return (
    <div
      style={{
        display: hide ? 'none' : 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-start',
        padding: '1rem',
        margin: '1rem',
        overflow: 'auto',
        border: '2px solid',
        borderRadius: '1rem',
        borderColor: 'rgba(168, 56, 253, 0.4)',
        backgroundColor: 'rgba(168, 56, 253, 0.15)',
      }}
    >
      <b>{`${getName(connector)} (Selected)`}</b>
      <StatusView
        connector={connector}
        accounts={accounts}
        accountIndex={accountIndex}
        isActivating={isActivating}
        isActive={isActive}
      />
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
        showOnlySelected={false}
      />
      {isActive && connector !== network && (
        <SignerButton connector={connector} provider={provider} account={account} />
      )}
      <SpacerView />
      <Button style={{ marginBottom: '16px' }} onClick={() => setSelectedConnector()} disabled={isPriority}>
        {`Reset to Priority (${priorityConnectorName})`}
      </Button>
    </div>
  )
}
