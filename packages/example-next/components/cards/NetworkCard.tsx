import { useWeb3React } from '@web3-react/core'
import { useEffect, useState } from 'react'
import { Card } from '../Card'
import { hooks, network } from '../../config/connectors/network'

const { useChainId, useAccounts, useIsActivating, useIsActive, useProvider, useENSNames, useENSAvatars } = hooks

export default function NetworkCard() {
  const {
    connector: selectedConnector,
    hooks: { usePriorityConnector },
  } = useWeb3React()

  const priorityConnector = usePriorityConnector()
  const isPriority = priorityConnector === network
  const isSelected = selectedConnector === network

  const chainId = useChainId()
  const accounts = useAccounts()
  const isActivating = useIsActivating()

  const isActive = useIsActive()

  const provider = useProvider()
  const ENSNames = useENSNames(provider)
  const ENSAvatars = useENSAvatars(provider, ENSNames)

  const [error, setError] = useState(undefined)

  // attempt to connect eagerly on mount
  useEffect(() => {
    void network.activate().catch(() => {
      console.debug('Failed to connect to network')
    })
  }, [])

  return (
    <Card
      connector={network}
      chainId={chainId}
      isActivating={isActivating}
      isActive={isActive}
      ENSNames={ENSNames}
      ENSAvatars={ENSAvatars}
      provider={provider}
      accounts={accounts}
      error={error}
      setError={setError}
      isPriority={isPriority}
      isSelected={isSelected}
    />
  )
}
