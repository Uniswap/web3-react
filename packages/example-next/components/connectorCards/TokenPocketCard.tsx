import { useEffect, useState } from 'react'
import { hooks, tokenPocket } from '../../connectors/tokenPocket'
import { Card } from '../Card'

const { useChainId, useAccounts, useIsActivating, useIsActive, useProvider, useENSNames } = hooks

export default function TokenPocketCard() {
  const chainId = useChainId()
  const accounts = useAccounts()
  const isActivating = useIsActivating()

  const isActive = useIsActive()

  const provider = useProvider()
  const ENSNames = useENSNames(provider)

  const [error, setError] = useState(undefined)

  // attempt to connect eagerly on mount
  useEffect(() => {
    void tokenPocket.connectEagerly().catch(() => {
      console.debug('Failed to connect eagerly to tokenpocket')
    })
  }, [])

  return (
    <Card
      connector={tokenPocket}
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
