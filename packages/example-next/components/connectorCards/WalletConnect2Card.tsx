import { useEffect, useState } from 'react'
import { hooks, walletConnect } from '../../connectors/walletConnect-v2'
import { Card } from '../Card'

const { useChainId, useAccounts, useIsActivating, useIsActive, useProvider, useENSNames } = hooks

export default function WalletConnect2Card() {
  const chainId = useChainId()
  const accounts = useAccounts()
  const isActivating = useIsActivating()

  const isActive = useIsActive()

  const provider = useProvider()
  const ENSNames = useENSNames(provider)

  const [error, setError] = useState(undefined)

  // attempt to connect eagerly on mount
  // useEffect(() => {
  //   walletConnect.connectEagerly().catch(() => {
  //     console.debug('Failed to connect eagerly to walletconnect-v2')
  //   })
  // }, [])

  return (
    <Card
      connector={walletConnect}
      chainId={chainId}
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
