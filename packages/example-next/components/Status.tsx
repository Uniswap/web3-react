import type { Web3ReactHooks } from '@web3-react/core'

export function Status({
  isActivating,
  isActive,
  error,
}: {
  isActivating: ReturnType<Web3ReactHooks['useIsActivating']>
  isActive: ReturnType<Web3ReactHooks['useIsActive']>
  error?: Error
}) {
  return (
    <div style={{ whiteSpace: error?.name ? 'normal' : 'pre', marginTop: '1em', width: '100%' }}>
      {error ? (
        <>
          🔴 {error.name ?? 'Error'}
          {error.message ? `: ${error.message}` : null}
        </>
      ) : isActivating ? (
        <>{`🟡  Connecting`}</>
      ) : isActive ? (
        <>{`🟢  Connected`}</>
      ) : (
        <>{`⚪️  Disconnected`}</>
      )}
    </div>
  )
}
