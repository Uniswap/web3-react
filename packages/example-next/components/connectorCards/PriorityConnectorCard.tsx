import { useWeb3React } from '@web3-react/core'
import { getName } from '../../utils'
import { Accounts } from '../Accounts'
import { Chain } from '../Chain'

export default function PriorityConnectorCard() {
  const {
    connector,
    chainId,
    ENSNames,
    accounts,
    provider,
    isActivating,
    isActive,
    resetSelectedConnector,
    hooks: { usePriorityConnector },
  } = useWeb3React()

  const priorityConnector = usePriorityConnector()
  const isPriority = priorityConnector === connector

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        width: '20rem',
        padding: '1rem',
        margin: '1rem',
        overflow: 'auto',
        border: '2px solid',
        borderRadius: '1rem',
        borderColor: isActivating ? 'yellow' : isActive ? 'limegreen' : 'red',
      }}
    >
      <b style={{ marginBottom: '1rem' }}>Selected Connector</b>
      <div>
        Name: <b>{getName(connector)}</b>
      </div>
      <Chain chainId={chainId} />
      <div style={{ marginBottom: '1rem' }}>
        <Accounts accounts={accounts} provider={provider} ENSNames={ENSNames} />
      </div>
      <button style={{ marginBottom: '1rem' }} onClick={resetSelectedConnector} disabled={isPriority}>
        Reset to Priority
      </button>
    </div>
  )
}
