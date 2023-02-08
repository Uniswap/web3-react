import type { Connector } from '@web3-react/types'
import { getName } from '../../utils/connectors'
import Image from 'next/image'

export default function ConnectorTitleView({
  connector,
  walletLogoUrl,
}: {
  connector: Connector
  walletLogoUrl?: string
}) {
  const connectorName = getName(connector)

  return (
    <div
      style={{
        display: 'inline-flex',
        justifyContent: 'flex-start',
        alignItems: 'center',
        overflow: 'hidden',
        maxWidth: '100%',
      }}
    >
      {walletLogoUrl && (
        <Image
          alt={`${connectorName ?? 'Connector'} Logo`}
          src={walletLogoUrl}
          style={{
            width: 'auto',
            minWidth: 24,
            height: 24,
            marginRight: '0.5em',
            borderRadius: '50%',
            overflow: 'hidden',
          }}
        />
      )}
      <b>{connectorName}</b>
    </div>
  )
}
