import { useWeb3React } from '@web3-react/core'
import { useEffect, useState } from 'react'
import { coinbaseWallet, hooks } from '../../connectors/coinbaseWallet'
import { Card } from '../Card'

const { useChainId, useAccounts, useIsActivating, useIsActive, useProvider, useENSNames } = hooks

export default function CoinbaseWalletCard() {
  const {
    connector,
    hooks: { usePriorityConnector },
  } = useWeb3React()

  const priorityConnector = usePriorityConnector()
  const isPriority = priorityConnector === coinbaseWallet
  const isSelected = connector === coinbaseWallet

  const chainId = useChainId()
  const accounts = useAccounts()
  const isActivating = useIsActivating()

  const isActive = useIsActive()

  const provider = useProvider()
  const ENSNames = useENSNames(provider)

  const [error, setError] = useState(undefined)

  // attempt to connect eagerly on mount
  useEffect(() => {
    void coinbaseWallet.connectEagerly().catch(() => {
      console.debug('Failed to connect eagerly to coinbase wallet')
    })
  }, [])

  return (
    <Card
      connector={coinbaseWallet}
      chainId={chainId}
      isActivating={isActivating}
      isActive={isActive}
      ENSNames={ENSNames}
      provider={provider}
      accounts={accounts}
      error={error}
      setError={setError}
      isPriority={isPriority}
      isSelected={isSelected}
    />
  )
}
