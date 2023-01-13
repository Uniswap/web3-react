import { useWeb3React } from '@web3-react/core'
import { useEffect, useState } from 'react'
import { Card } from '../Card'
import { hooks, tronWallet } from '../../config/connectors/tronLink'
import Button from '../Button'

const {
  useChainId,
  useAccounts,
  useAccountIndex,
  useIsActivating,
  useIsActive,
  useProvider,
  useBlockNumber,
  useBalances,
  useWatchingAsset,
} = hooks

export default function TronLinkCard() {
  const {
    connector: selectedConnector,
    hooks: { usePriorityConnector },
  } = useWeb3React()

  const priorityConnector = usePriorityConnector()
  const isPriority = priorityConnector === tronWallet
  const isSelected = selectedConnector === tronWallet

  const provider = useProvider()
  const chainId = useChainId()
  const accounts = useAccounts()
  const accountIndex = useAccountIndex()
  const isActivating = useIsActivating()
  const isActive = useIsActive()
  const watchingAsset = useWatchingAsset()

  const { blockNumber, fetch: fetchBlockNumber } = useBlockNumber(false)
  const { balances, fetch: fetchBalances } = useBalances(false)

  const [error, setError] = useState(undefined)

  // attempt to connect eagerly on mount
  useEffect(() => {
    void tronWallet.connectEagerly().catch(() => {
      console.debug('Failed to connect eagerly to bsc wallet')
    })
  }, [])

  return (
    <Card
      walletLogoUrl="https://styles.redditmedia.com/t5_44alvn/styles/communityIcon_7m97pzfqt1o61.png"
      connector={tronWallet}
      chainId={chainId}
      accountIndex={accountIndex}
      isActivating={isActivating}
      isActive={isActive}
      provider={provider}
      accounts={accounts}
      blockNumber={blockNumber}
      balances={balances}
      watchingAsset={watchingAsset}
      error={error}
      setError={setError}
      isPriority={isPriority}
      isSelected={isSelected}
    >
      <Button
        onClick={() => {
          void fetchBlockNumber()
          void fetchBalances()
        }}
      >
        Refresh
      </Button>
    </Card>
  )
}
