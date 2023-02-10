import type { Connector } from '@web3-react/types'
import type { StaticImageData } from 'next/image'
import Image from 'next/image'

import { getName } from '../../../utils/connectors'

export default function ConnectorTitleView({
  connector,
  walletLogoUrl,
}: {
  connector: Connector
  walletLogoUrl?: string | StaticImageData
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
          width={24}
          height={24}
          style={{
            width: 'auto',
            minWidth: 24,
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
