import { useEffect, useState } from 'react'
import { Card } from '../Card'
import { gnosisSafe, hooks } from '../../../config/connectors/gnosisSafe'
import gnosisSafeLogo from '../../../images/wallet/gnosis.png'

const { useChainId, useAccounts, useIsActivating, useIsActive, useProvider, useENSNames, useENSAvatars } = hooks

export default function GnosisSafeCard({ hide }: { hide: boolean }) {
  const provider = useProvider()
  const chainId = useChainId()
  const accounts = useAccounts()
  const isActivating = useIsActivating()
  const isActive = useIsActive()
  const ENSNames = useENSNames(provider)
  const ENSAvatars = useENSAvatars(provider, ENSNames)

  const [error, setError] = useState(undefined)

  // attempt to connect eagerly on mount
  useEffect(() => {
    void gnosisSafe.connectEagerly().catch(() => {
      console.debug('Failed to connect eagerly to gnosis safe')
    })
  }, [])

  return (
    <Card
      hide={hide}
      walletLogoUrl={gnosisSafeLogo}
      connector={gnosisSafe}
      chainId={chainId}
      isActivating={isActivating}
      isActive={isActive}
      ENSNames={ENSNames}
      ENSAvatars={ENSAvatars}
      provider={provider}
      accounts={accounts}
      error={error}
      setError={setError}
    />
  )
}
