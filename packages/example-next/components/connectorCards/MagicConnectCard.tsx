import { useEffect, useState } from 'react'
import { magicConnect, magicConnectHooks } from '../../connectors/magic-connect'
import { Card } from '../Card'

const { useChainId, useAccounts, useIsActivating, useIsActive, useProvider, useENSNames } = magicConnectHooks

export default function MagicConnectCard() {
  const chainId = useChainId()
  const accounts = useAccounts()
  const isActivating = useIsActivating()

  const isActive = useIsActive()

  const provider = useProvider()
  const ENSNames = useENSNames(provider)

  const [error, setError] = useState(undefined)

  // attempt to connect eagerly on mount
  useEffect(() => {
    void magicConnect.connectEagerly().catch(() => {
      console.debug('Failed to connect eagerly to magic connect')
    })
  }, [])

  return (
    <Card
      connector={magicConnect}
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
