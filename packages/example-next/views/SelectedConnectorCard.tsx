import { useWeb3React } from '@web3-react/core'
import { Accounts } from '../components/Accounts'
import { Button } from '../components/Button'
import { Chain } from '../components/Chain'
import Signer from '../components/Signer'
import Spacer from '../components/Spacer'
import { Status } from '../components/Status'
import { getName } from '../utils/connectors'

export default function SelectedConnectorCard() {
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
    hooks: { usePriorityConnector },
  } = useWeb3React()

  const priorityConnector = usePriorityConnector()
  const isPriority = priorityConnector === connector
  const priorityConnectorName = getName(priorityConnector)

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-start',
        width: '20rem',
        padding: '1rem',
        margin: '1rem',
        overflow: 'auto',
        border: '2px solid',
        borderRadius: '1rem',
        borderColor: 'rgba(168, 56, 253, 0.4)',
        backgroundColor: 'rgba(168, 56, 253, 0.15)',
      }}
    >
      <b>{`Selected Connector (${getName(connector)})`}</b>
      <div style={{ marginBottom: '1rem' }}>
        <Status isActivating={isActivating} isActive={isActive} />
      </div>
      <Chain chainId={chainId} />
      <Accounts
        accountIndex={accountIndex}
        accounts={accounts}
        provider={provider}
        ENSNames={ENSNames}
        ENSAvatars={ENSAvatars}
      />
      <Spacer />
      <Button onClick={() => setSelectedConnector()} disabled={isPriority}>
        {`Reset to ${priorityConnectorName}`}
      </Button>
      {isActive && <Signer provider={provider} account={accounts ? (accounts[accountIndex] as string) : ''} />}
    </div>
  )
}
