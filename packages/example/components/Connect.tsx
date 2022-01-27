import type { Web3ReactHooks } from '@web3-react/core'
import type { Connector } from '@web3-react/types'

export function Connect({
  activate,
  deactivate,
  isActivating,
  error,
  isActive,
}: {
  activate: Connector['activate']
  deactivate: Connector['deactivate']
  isActivating: ReturnType<Web3ReactHooks['useIsActivating']>
  error: ReturnType<Web3ReactHooks['useError']>
  isActive: ReturnType<Web3ReactHooks['useIsActive']>
}) {
  if (error) return <button onClick={activate}>Try Again?</button>
  if (isActive) return <button onClick={deactivate}>Disconnect</button>

  return (
    <button onClick={isActivating ? undefined : activate} disabled={isActivating}>
      Connect
    </button>
  )
}
