import { useEffect, useState } from 'react'

import { bscWallet, hooks } from '../../../config/connectors/bscWallet'
import { Card } from '../Card'

const {
  useChainId,
  useAccounts,
  useAccountIndex,
  useIsActivating,
  useIsActive,
  useProvider,
  useAddingChain,
  useSwitchingChain,
  useWatchingAsset,
} = hooks

export default function BscWalletCard({ hide }: { hide: boolean }) {
  const provider = useProvider()
  const chainId = useChainId()
  const accounts = useAccounts()
  const accountIndex = useAccountIndex()
  const isActivating = useIsActivating()
  const isActive = useIsActive()
  const addingChain = useAddingChain()
  const switchingChain = useSwitchingChain()
  const watchingAsset = useWatchingAsset()

  const [error, setError] = useState(undefined)

  // attempt to connect eagerly on mount
  useEffect(() => {
    void bscWallet.connectEagerly().catch(() => {
      console.debug('Failed to connect eagerly to bsc wallet')
    })
  }, [])

  return (
    <Card
      hide={hide}
      connector={bscWallet}
      chainId={chainId}
      accountIndex={accountIndex}
      isActivating={isActivating}
      isActive={isActive}
      provider={provider}
      accounts={accounts}
      addingChain={addingChain}
      switchingChain={switchingChain}
      watchingAsset={watchingAsset}
      error={error}
      setError={setError}
    />
  )
}
