import { useEffect, useState } from 'react'
import { Card } from '../Card'
import { hooks, solflare } from '../../../config/connectors/solflare'
import solflareLogo from '../../../public/static/images/wallet/solflare.png'

const { useChainId, useAccounts, useAccountIndex, useIsActivating, useIsActive, useProvider, useSwitchingChain } = hooks

export default function SolflareWalletCard({ hide }: { hide: boolean }) {
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
    void solflare.connectEagerly().catch(() => {
      console.debug('Failed to connect eagerly to solflare wallet')
    })
  }, [])

  return (
    <Card
      hide={hide}
      walletLogoUrl={solflareLogo}
      connector={solflare}
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
