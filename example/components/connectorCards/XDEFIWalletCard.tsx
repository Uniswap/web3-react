import { useEffect, useState } from 'react'
import { hooks, xdefiWallet } from '../../connectors/xdefiWallet'
import { Card } from '../Card'


const { useChainId, useAccounts, useIsActivating, useIsActive, useProvider, useENSNames } = hooks

export default function XDEFIWalletCard() {
  const chainId = useChainId()
  const accounts = useAccounts()
  const isActivating = useIsActivating()

  const isActive = useIsActive()

  const provider = useProvider()
  const ENSNames = useENSNames(provider)

  const [error, setError] = useState(undefined)

  useEffect(() => {
    xdefiWallet.connectEagerly().catch((error) => {
      console.debug('Failed to connect eagerly to XDEFI Wallet', error)
    })
  }, [])

  return (
    <Card
      connector={xdefiWallet}
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