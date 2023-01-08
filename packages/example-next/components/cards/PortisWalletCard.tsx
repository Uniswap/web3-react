import { useWeb3React } from '@web3-react/core'
import { useCallback, useEffect, useState } from 'react'
import { Card } from '../Card'
import { portisWallet, hooks } from '../../config/connectors/portisWallet'
import Button from '../Button'

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

export default function PortisWalletCard() {
  const {
    connector: selectedConnector,
    hooks: { usePriorityConnector },
  } = useWeb3React()

  const { showPortis, isShowing } = useShowPortis()
  const { showPortis: showPortisBitcoin, isShowing: isShowingBitcoin } = useShowPortis(true)

  const priorityConnector = usePriorityConnector()
  const isPriority = priorityConnector === portisWallet
  const isSelected = selectedConnector === portisWallet

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
      walletLogoUrl="https://www.portis.io/static/logo-small.svg"
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
      isPriority={isPriority}
      isSelected={isSelected}
    >
      <Button style={{ marginBottom: '1em' }} disabled={isShowing} onClick={() => void showPortis()}>
        Show Wallet
      </Button>
      <Button disabled={isShowingBitcoin} onClick={() => void showPortisBitcoin()}>
        Show Bitcoin Wallet
      </Button>
    </Card>
  )
}
