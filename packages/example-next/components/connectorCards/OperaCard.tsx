import { useEffect, useState } from 'react'
import { hooks, opera } from '../../connectors/opera'
import { Card } from '../Card'

const { useChainId, useAccounts, useError, useIsActivating, useIsActive, useProvider, useENSNames } = hooks

export default function OperaCard() {
    const chainId = useChainId()
    const accounts = useAccounts()
    const isActivating = useIsActivating()
  
    const isActive = useIsActive()
  
    const provider = useProvider()
    const ENSNames = useENSNames(provider)
  
    const [error, setError] = useState(undefined)

  return (
    <Card
      connector={opera}
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