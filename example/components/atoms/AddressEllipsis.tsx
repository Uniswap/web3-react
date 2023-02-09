import { textPartFromWalletChecksumImagePart } from '@emurgo/cip4-js'
import { NamiWallet } from '@web3-react/nami'
import type { Connector } from '@web3-react/types'
import { YoroiWallet } from '@web3-react/yoroi'

export default function AddressEllipsis({
  connector,
  account,
  ensName,
  cardanoWallplate = true,
}: {
  connector: Connector
  account?: string
  ensName?: string
  cardanoWallplate?: boolean
}) {
  if (!account && !ensName) return <b>None</b>

  return ensName ? (
    <b>{ensName}</b>
  ) : cardanoWallplate && (connector instanceof YoroiWallet || connector instanceof NamiWallet) ? (
    <b>{textPartFromWalletChecksumImagePart(account)}</b>
  ) : (
    <>
      <b
        style={{
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          display: 'inline-block',
          textOverflow: 'ellipsis',
        }}
      >
        {account?.substring(0, account.length - 4) || ''}
      </b>
      <b
        style={{
          flexShrink: 0,
        }}
      >
        {account?.substr(account.length - 4, 4) || ''}
      </b>
    </>
  )
}
