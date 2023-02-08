import { useEffect, useState } from 'react'
import { Card } from '../Card'
import { hooks, phantom } from '../../../config/connectors/phantom'
import phantomLogo from '../../../images/wallet/phantom.png'

const { useChainId, useAccounts, useAccountIndex, useIsActivating, useIsActive, useProvider, useSwitchingChain } = hooks

export default function PhantomWalletCard({ hide }: { hide: boolean }) {
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
    void phantom.connectEagerly().catch(() => {
      console.debug('Failed to connect eagerly to phantom wallet')
    })
  }, [])

  return (
    <Card
      hide={hide}
      walletLogoUrl={phantomLogo}
      connector={phantom}
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
