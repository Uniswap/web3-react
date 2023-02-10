import { useEffect, useState } from 'react'

import { hooks, nami } from '../../../config/connectors/nami'
import { Card } from '../Card'

const { useChainId, useAccounts, useAccountIndex, useIsActivating, useIsActive, useProvider, useSwitchingChain } = hooks

export default function NamiWalletCard({ hide }: { hide: boolean }) {
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
    void nami.connectEagerly().catch(() => {
      console.debug('Failed to connect eagerly to nami wallet')
    })
  }, [])

  return (
    <Card
      hide={hide}
      walletLogoUrl={nami.initialApi?.icon}
      connector={nami}
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
