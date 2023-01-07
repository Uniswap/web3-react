export default function AddressEllipsis({ account, ensName }: { account?: string; ensName?: string }) {
  if (!account && !ensName) return <b>None</b>

  return ensName ? (
    <b>{ensName}</b>
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
