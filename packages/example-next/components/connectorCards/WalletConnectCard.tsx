import { useWeb3React } from '@web3-react/core'
import { URI_AVAILABLE } from '@web3-react/walletconnect'
import { useEffect, useState } from 'react'
import { hooks, walletConnect } from '../../connectors/walletConnect'
import { Card } from '../Card'

const { useChainId, useAccounts, useIsActivating, useIsActive, useProvider, useENSNames } = hooks

export default function WalletConnectCard() {
  const {
    connector,
    hooks: { usePriorityConnector },
  } = useWeb3React()

  const priorityConnector = usePriorityConnector()
  const isPriority = priorityConnector === walletConnect
  const isSelected = connector === walletConnect

  const chainId = useChainId()
  const accounts = useAccounts()
  const isActivating = useIsActivating()

  const isActive = useIsActive()

  const provider = useProvider()
  const ENSNames = useENSNames(provider)

  const [error, setError] = useState(undefined)

  // log URI when available
  useEffect(() => {
    walletConnect.events.on(URI_AVAILABLE, (uri: string) => {
      console.log(`uri: ${uri}`)
    })
  }, [])

  // attempt to connect eagerly on mount
  useEffect(() => {
    walletConnect.connectEagerly().catch(() => {
      console.debug('Failed to connect eagerly to walletconnect')
    })
  }, [])

  return (
    <Card
      connector={walletConnect}
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
