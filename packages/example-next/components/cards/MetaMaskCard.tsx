import { useWeb3React } from '@web3-react/core'
import { useEffect, useState } from 'react'
import { Card } from '../Card'
import { hooks, metaMask } from '../../config/connectors/metaMask'

const {
  useChainId,
  useAccounts,
  useAccountIndex,
  useIsActivating,
  useIsActive,
  useProvider,
  useENSNames,
  useENSAvatars,
  useAddingChain,
  useSwitchingChain,
  useWatchingAsset,
} = hooks

export default function MetaMaskCard() {
  const {
    connector: selectedConnector,
    hooks: { usePriorityConnector },
  } = useWeb3React()

  const priorityConnector = usePriorityConnector()
  const isPriority = priorityConnector === metaMask
  const isSelected = selectedConnector === metaMask

  const chainId = useChainId()
  const accounts = useAccounts()
  const accountIndex = useAccountIndex()
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
    void metaMask.connectEagerly().catch(() => {
      console.debug('Failed to connect eagerly to metamask')
    })
  }, [])

  return (
    <Card
      walletLogo="https://upload.wikimedia.org/wikipedia/commons/thumb/3/36/MetaMask_Fox.svg/1200px-MetaMask_Fox.svg.png"
      connector={metaMask}
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
    />
  )
}
