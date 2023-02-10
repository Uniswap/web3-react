import { useWeb3React } from '@web3-react/core'
import type { Connector } from '@web3-react/types'

export default function SelectionView({ connector }: { connector: Connector }) {
  const {
    // connector: selectedConnector,
    hooks: { usePriorityConnector },
  } = useWeb3React()

  const priorityConnector = usePriorityConnector()
  const isPriority = priorityConnector === connector
  // const isSelected = selectedConnector === connector

  return (
    <>
      {isPriority && (
        <div style={{ whiteSpace: 'pre', display: 'flex', alignItems: 'center', marginBottom: '4px' }}>
          Priority: <b style={{ fontSize: '0.7em', lineHeight: '1em' }}>{isPriority ? ' ✅' : ' ❌'}</b>
        </div>
      )}
      {/* <div style={{ whiteSpace: 'pre', display: 'flex', alignItems: 'center', marginBottom: '4px' }}>
        Selected: <b style={{ fontSize: '0.7em', lineHeight: '1em' }}>{isSelected ? ' ✅' : ' ❌'}</b>
      </div> */}
    </>
  )
}
