import { useWeb3React } from '@web3-react/core'
import { Accounts } from '../Accounts'
import Button from '../Button'
import { Chain } from '../Chain'
import SignerButton from '../SignerButton'
import Spacer from '../Spacer'
import { Status } from '../Status'
import { network } from '../../config/connectors/network'
import { getName } from '../../utils/connectors'

export default function SelectedConnectorCard() {
  const {
    connector,
    chainId,
    accountIndex,
    accounts,
    blockNumber,
    balances,
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
        <Status connector={connector} account={account} isActivating={isActivating} isActive={isActive} />
      </div>
      <Chain chainId={chainId} addingChain={addingChain} switchingChain={switchingChain} blockNumber={blockNumber} />
      <Accounts
        balances={balances}
        accountIndex={accountIndex}
        accounts={accounts}
        chainId={chainId}
        ENSNames={ENSNames}
        ENSAvatars={ENSAvatars}
      />
      {isActive && connector !== network && <SignerButton provider={provider} account={account} />}
      <Spacer />
      <Button style={{ marginBottom: '16px' }} onClick={() => setSelectedConnector()} disabled={isPriority}>
        {`Reset to Priority (${priorityConnectorName})`}
      </Button>
    </div>
  )
}
