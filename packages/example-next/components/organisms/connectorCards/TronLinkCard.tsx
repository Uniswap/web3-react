import { useEffect, useState } from 'react'
import { Card } from '../Card'
import { hooks, tronLink } from '../../../config/connectors/tronLink'

const { useChainId, useAccounts, useAccountIndex, useIsActivating, useIsActive, useProvider, useWatchingAsset } = hooks

export default function TronLinkCard({ hide }: { hide: boolean }) {
  const provider = useProvider()
  const chainId = useChainId()
  const accounts = useAccounts()
  const accountIndex = useAccountIndex()
  const isActivating = useIsActivating()
  const isActive = useIsActive()
  const watchingAsset = useWatchingAsset()

  const [error, setError] = useState(undefined)

  // attempt to connect eagerly on mount
  useEffect(() => {
    void tronLink.connectEagerly().catch(() => {
      console.debug('Failed to connect eagerly to bsc wallet')
    })
  }, [])

  return (
    <Card
      hide={hide}
      walletLogoUrl="https://styles.redditmedia.com/t5_44alvn/styles/communityIcon_7m97pzfqt1o61.png"
      connector={tronLink}
      chainId={chainId}
      accountIndex={accountIndex}
      isActivating={isActivating}
      isActive={isActive}
      provider={provider}
      accounts={accounts}
      watchingAsset={watchingAsset}
      error={error}
      setError={setError}
    />
  )
}
