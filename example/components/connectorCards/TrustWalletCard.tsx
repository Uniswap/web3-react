import { useEffect, useState } from 'react'
import { hooks, trustWallet } from '../../connectors/trustWallet'
import { Card } from '../Card'

const { useChainId, useAccounts, useIsActivating, useIsActive, useProvider, useENSNames } = hooks

export default function TrustWalletCard() {
  const chainId = useChainId()
  const accounts = useAccounts()
  const isActivating = useIsActivating()

  const isActive = useIsActive()

  const provider = useProvider()
  const ENSNames = useENSNames(provider)

  const [error, setError] = useState(undefined)

  useEffect(() => {
    trustWallet.connectEagerly().catch((error) => {
      console.debug('Failed to connect eagerly to OKX Wallet', error)
    })
  }, [])

  return (
    <Card
      connector={trustWallet}
      activeChainId={chainId}
      isActivating={isActivating}
      isActive={isActive}
      error={error}
      setError={setError}
      accounts={accounts}
      provider={provider}
      ENSNames={ENSNames}
    />
  )
}