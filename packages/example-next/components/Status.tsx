import type { Web3ReactHooks } from '@web3-react/core'

export function Status({
  isActivating,
  isActive,
}: {
  isActivating: ReturnType<Web3ReactHooks['useIsActivating']>
  isActive: ReturnType<Web3ReactHooks['useIsActive']>
}) {
  return <div>{isActivating ? <>🟡 Connecting</> : isActive ? <>🟢 Connected</> : <>⚪️ Disconnected</>}</div>
}
