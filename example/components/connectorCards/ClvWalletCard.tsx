import { useEffect, useState } from 'react'
import { hooks, clvWallet } from '../../connectors/clvWallet'
import { Card } from '../Card'


const { useChainId, useAccounts, useIsActivating, useIsActive, useProvider, useENSNames } = hooks

export default function ClvWalletCard() {
  const chainId = useChainId()
  const accounts = useAccounts()
  const isActivating = useIsActivating()

  const isActive = useIsActive()

  const provider = useProvider()
  const ENSNames = useENSNames(provider)

  const [error, setError] = useState(undefined)

  // attempt to connect eagerly on mount
  useEffect(() => {
    clvWallet.connectEagerly().catch((error) => {
      console.debug('Failed to connect eagerly to clvWallet', error)
    })
  }, [])

  return (
    <Card
      connector={clvWallet}
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
