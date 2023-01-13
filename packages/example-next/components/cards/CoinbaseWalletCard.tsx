import { useWeb3React } from '@web3-react/core'
import { useEffect, useState } from 'react'
import { Card } from '../Card'
import { coinbaseWallet, hooks } from '../../config/connectors/coinbaseWallet'
import Button from '../Button'

const {
  useChainId,
  useAccountIndex,
  useAccounts,
  useIsActivating,
  useIsActive,
  useProvider,
  useBalances,
  useBlockNumber,
  useENSNames,
  useENSAvatars,
  useAddingChain,
  useSwitchingChain,
  useWatchingAsset,
} = hooks

export default function CoinbaseWalletCard() {
  const {
    connector: selectedConnector,
    hooks: { usePriorityConnector },
  } = useWeb3React()

  const priorityConnector = usePriorityConnector()
  const isPriority = priorityConnector === coinbaseWallet
  const isSelected = selectedConnector === coinbaseWallet

  const provider = useProvider()
  const chainId = useChainId()
  const accountIndex = useAccountIndex()
  const accounts = useAccounts()
  const isActivating = useIsActivating()
  const isActive = useIsActive()
  const addingChain = useAddingChain()
  const switchingChain = useSwitchingChain()
  const watchingAsset = useWatchingAsset()
  const ENSNames = useENSNames(provider)
  const ENSAvatars = useENSAvatars(provider, ENSNames)

  const { blockNumber, fetch: fetchBlockNumber } = useBlockNumber(false)
  const { balances, fetch: fetchBalances } = useBalances(false)

  const [error, setError] = useState(undefined)

  // attempt to connect eagerly on mount
  useEffect(() => {
    void coinbaseWallet.connectEagerly().catch(() => {
      console.debug('Failed to connect eagerly to coinbase wallet')
    })
  }, [])

  return (
    <Card
      walletLogoUrl={coinbaseWallet.getWalletLogoUrl('circle', 24)}
      connector={coinbaseWallet}
      chainId={chainId}
      accountIndex={accountIndex}
      isActivating={isActivating}
      isActive={isActive}
      ENSNames={ENSNames}
      ENSAvatars={ENSAvatars}
      provider={provider}
      accounts={accounts}
      blockNumber={blockNumber}
      balances={balances}
      addingChain={addingChain}
      switchingChain={switchingChain}
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
