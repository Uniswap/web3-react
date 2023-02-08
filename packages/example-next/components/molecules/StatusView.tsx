import type { Web3ReactHooks } from '@web3-react/core'
import type { Connector } from '@web3-react/types'
import { Network } from '@web3-react/network'
import SpacerView from '../atoms/SpacerView'

export default function StatusView({
  connector,
  accountIndex,
  accounts,
  isActivating,
  isActive,
  error,
}: {
  connector?: Connector
  accountIndex?: ReturnType<Web3ReactHooks['useAccountIndex']>
  accounts?: string[]
  isActivating: ReturnType<Web3ReactHooks['useIsActivating']>
  isActive: ReturnType<Web3ReactHooks['useIsActive']>
  error?: Error
}) {
  const account = (accounts?.[accountIndex] as string) ?? undefined

  return (
    <>
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
            style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'flex-start',
              alignItems: 'flex-start',
              width: '100%',
            }}
          >
            <div style={{ display: 'inline-flex', alignItems: 'center', width: '100%' }}>
              <p style={{ fontSize: '0.7em', lineHeight: '1em', marginTop: '0.5em', marginBottom: '0.5em' }}>{`🔴 `}</p>
              {error?.name ? ` ${error.name}` : ' Error'}
            </div>
            <p style={{ width: '100%', whiteSpace: 'normal', marginTop: '0.5em', marginBottom: '0.5em' }}>
              {error.message ? `- ${error.message}` : null}
            </p>
          </div>
        ) : isActivating ? (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'flex-start',
              alignItems: 'flex-start',
              width: '100%',
            }}
          >
            <div style={{ display: 'inline-flex', alignItems: 'center', width: '100%' }}>
              <p style={{ fontSize: '0.7em', lineHeight: '0.95em' }}>🟡</p>
              {'  Connecting'}
            </div>
          </div>
        ) : isActive ? (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'flex-start',
              alignItems: 'flex-start',
              width: '100%',
            }}
          >
            <div style={{ display: 'inline-flex', alignItems: 'center', width: '100%' }}>
              <p style={{ fontSize: '0.7em', lineHeight: '0.95em' }}>🟢</p>
              {'  Connected'}
            </div>
            {!account && !(connector instanceof Network) && (
              <p
                style={{ width: '100%', whiteSpace: 'pre', marginTop: '0.5em', marginBottom: '0.5em', marginLeft: -1 }}
              >
                {'⚠️  Unlock wallet'}
              </p>
            )}
          </div>
        ) : (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'flex-start',
              alignItems: 'flex-start',
              width: '100%',
            }}
          >
            <div style={{ display: 'inline-flex', alignItems: 'center', width: '100%' }}>
              <p style={{ fontSize: '0.7em', lineHeight: '0.95em' }}>⚪️</p>
              {'  Disconnected'}
            </div>
          </div>
        )}
      </div>
      {!!accounts?.length && <SpacerView />}
    </>
  )
}
