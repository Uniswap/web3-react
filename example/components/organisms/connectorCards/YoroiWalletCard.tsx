import { useEffect, useState } from 'react'

import { hooks, yoroi } from '../../../config/connectors/yoroi'
import { Card } from '../Card'

const { useChainId, useAccounts, useAccountIndex, useIsActivating, useIsActive, useProvider, useSwitchingChain } = hooks

export default function YoroiWalletCard({ hide }: { hide: boolean }) {
  const provider = useProvider()
  const chainId = useChainId()
  const accounts = useAccounts()
  const accountIndex = useAccountIndex()
  const isActivating = useIsActivating()
  const isActive = useIsActive()
  const switchingChain = useSwitchingChain()

  const [error, setError] = useState(undefined)

  // attempt to connect eagerly on mount
  useEffect(() => {
    void yoroi.connectEagerly().catch(() => {
      console.debug('Failed to connect eagerly to yoroi wallet')
    })
  }, [])

  return (
    <Card
      hide={hide}
      walletLogoUrl={yoroi.initialApi?.icon}
      connector={yoroi}
      chainId={chainId}
      accountIndex={accountIndex}
      isActivating={isActivating}
      isActive={isActive}
      provider={provider}
      accounts={accounts}
      switchingChain={switchingChain}
      error={error}
      setError={setError}
    />
  )
}
