import { useWeb3React } from '@web3-react/core'
import { Accounts } from '../components/Accounts'
import { Button } from '../components/Button'
import { Chain } from '../components/Chain'
import { Status } from '../components/Status'
import { getName } from '../utils/connectors'

export default function SelectedConnectorCard() {
  const {
    connector,
    chainId,
    ENSNames,
    accounts,
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
      <b>Selected Connector</b>
      <div style={{ marginBottom: '1rem' }}>
        <Status isActivating={isActivating} isActive={isActive} />
      </div>
      <div>
        Name: <b>{getName(connector)}</b>
      </div>
      <Chain chainId={chainId} />
      <div style={{ marginBottom: '1rem' }}>
        <Accounts accounts={accounts} provider={provider} ENSNames={ENSNames} />
      </div>
      <Button style={{ marginBottom: '1rem' }} onClick={() => setSelectedConnector()} disabled={isPriority}>
        {`Reset to ${priorityConnectorName}`}
      </Button>
    </div>
  )
}
