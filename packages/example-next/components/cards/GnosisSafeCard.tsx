import { useWeb3React } from '@web3-react/core'
import { useEffect, useState } from 'react'
import { Card } from '../Card'
import { gnosisSafe, hooks } from '../../config/connectors/gnosisSafe'

const { useChainId, useAccounts, useIsActivating, useIsActive, useProvider, useENSNames, useENSAvatars } = hooks

export default function GnosisSafeCard() {
  const {
    connector: selectedConnector,
    hooks: { usePriorityConnector },
  } = useWeb3React()

  const priorityConnector = usePriorityConnector()
  const isPriority = priorityConnector === gnosisSafe
  const isSelected = selectedConnector === gnosisSafe

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
    void gnosisSafe.connectEagerly().catch(() => {
      console.debug('Failed to connect eagerly to gnosis safe')
    })
  }, [])

  return (
    <Card
      walletLogoUrl="https://assets-global.website-files.com/61571d3b8fe2e30679056424/6341d34a6a3b918698693b5e_gnosis.png"
      connector={gnosisSafe}
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
