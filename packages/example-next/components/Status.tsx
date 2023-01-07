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
    <div
      style={{
        marginTop: '1em',
        width: '100%',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'flex-start',
        whiteSpace: 'pre',
      }}
    >
      {error ? (
        <>
          <p style={{ fontSize: '0.7em', lineHeight: '1em' }}>{`🔴 `}</p>
          {error.name ?? 'Error'}
          {error.message ? `: ${error.message}` : null}
        </>
      ) : isActivating ? (
        <>
          <p style={{ fontSize: '0.7em', lineHeight: '1em' }}>🟡</p>
          {' Connecting'}
        </>
      ) : isActive ? (
        <>
          <p style={{ fontSize: '0.7em', lineHeight: '1em' }}>🟢</p>
          {' Connected'}
        </>
      ) : (
        <>
          <p style={{ fontSize: '0.7em', lineHeight: '1em' }}>⚪️</p>
          {' Disconnected'}
        </>
      )}
    </div>
  )
}
