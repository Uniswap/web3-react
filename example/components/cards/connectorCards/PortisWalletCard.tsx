import { useCallback, useEffect, useState } from 'react'

import { hooks, portisWallet } from '../../../config/connectors/portisWallet'
import Button from '../../controls/Button'
import { Card } from '../Card'

const {
  useChainId,
  useAccountIndex,
  useAccounts,
  useIsActivating,
  useIsActive,
  useProvider,
  useENSNames,
  useENSAvatars,
  useAddingChain,
  useSwitchingChain,
  useWatchingAsset,
} = hooks

function useShowPortis(showBitcoin?: boolean) {
  const [isShowing, setIsShowing] = useState(false)

  const showPortis = useCallback(async () => {
    try {
      setIsShowing(true)
      await (showBitcoin ? portisWallet.portis.showBitcoinWallet() : portisWallet.portis.showPortis())
      setIsShowing(false)
    } catch (error) {
      setIsShowing(false)
    }
  }, [showBitcoin])

  return { showPortis, isShowing }
}

export default function PortisWalletCard({ hide }: { hide: boolean }) {
  const { showPortis, isShowing } = useShowPortis()
  const { showPortis: showPortisBitcoin, isShowing: isShowingBitcoin } = useShowPortis(true)

  const chainId = useChainId()
  const accountIndex = useAccountIndex()
  const accounts = useAccounts()
  const isActivating = useIsActivating()

  const isActive = useIsActive()

  const provider = useProvider()
  const ENSNames = useENSNames(provider)
  const ENSAvatars = useENSAvatars(provider, ENSNames)

  const addingChain = useAddingChain()
  const switchingChain = useSwitchingChain()
  const watchingAsset = useWatchingAsset()

  const [error, setError] = useState(undefined)

  // attempt to connect eagerly on mount
  useEffect(() => {
    void portisWallet.connectEagerly().catch(() => {
      console.debug('Failed to connect eagerly to portis wallet')
    })
  }, [])

  return (
    <Card
      hide={hide}
      connector={portisWallet}
      chainId={chainId}
      accountIndex={accountIndex}
      isActivating={isActivating}
      isActive={isActive}
      ENSNames={ENSNames}
      ENSAvatars={ENSAvatars}
      provider={provider}
      accounts={accounts}
      addingChain={addingChain}
      switchingChain={switchingChain}
      watchingAsset={watchingAsset}
      error={error}
      setError={setError}
    >
      {isActive && (
        <>
          <Button style={{ marginBottom: '1em' }} disabled={isShowing} onClick={() => void showPortis()}>
            Show Wallet
          </Button>
          <Button disabled={isShowingBitcoin} onClick={() => void showPortisBitcoin()}>
            Show Bitcoin Wallet
          </Button>
        </>
      )}
    </Card>
  )
}
