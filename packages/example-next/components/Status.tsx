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
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'flex-start',
        whiteSpace: 'pre',
        wordWrap: 'break-word',
      }}
    >
      {error ? (
        <div
          style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start' }}
        >
          <div style={{ display: 'inline-flex', alignItems: 'center', width: '100%' }}>
            <p style={{ fontSize: '0.7em', lineHeight: '1em', marginTop: 8, marginBottom: 8 }}>{`🔴 `}</p>
            {error?.name ? ` ${error.name}` : ' Error'}
          </div>
          <p style={{ width: '100%', whiteSpace: 'normal', marginTop: 8, marginBottom: 8 }}>
            {error.message ? `- ${error.message}` : null}
          </p>
        </div>
      ) : isActivating ? (
        <div style={{ display: 'inline-flex', alignItems: 'center', width: '100%' }}>
          <p style={{ fontSize: '0.7em', lineHeight: '0.95em' }}>🟡</p>
          {'  Connecting'}
        </div>
      ) : isActive ? (
        <div style={{ display: 'inline-flex', alignItems: 'center', width: '100%' }}>
          <p style={{ fontSize: '0.7em', lineHeight: '0.95em' }}>🟢</p>
          {'  Connected'}
        </div>
      ) : (
        <div style={{ display: 'inline-flex', alignItems: 'center', width: '100%' }}>
          <p style={{ fontSize: '0.7em', lineHeight: '0.95em' }}>⚪️</p>
          {'  Disconnected'}
        </div>
      )}
    </div>
  )
}
