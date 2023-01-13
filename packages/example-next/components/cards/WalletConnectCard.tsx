import { useWeb3React } from '@web3-react/core'
import { URI_AVAILABLE } from '@web3-react/walletconnect'
import { useEffect, useState } from 'react'
import { Card } from '../../components/Card'
import { hooks, walletConnect } from '../../config/connectors/walletConnect'
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
  useENSNames,
  useENSAvatars,
} = hooks

export default function WalletConnectCard() {
  const {
    connector: selectedConnector,
    hooks: { usePriorityConnector },
  } = useWeb3React()

  const priorityConnector = usePriorityConnector()
  const isPriority = priorityConnector === walletConnect
  const isSelected = selectedConnector === walletConnect

  const chainId = useChainId()
  const accounts = useAccounts()
  const accountIndex = useAccountIndex()
  const isActivating = useIsActivating()
  const isActive = useIsActive()
  const provider = useProvider()
  const ENSNames = useENSNames(provider)
  const ENSAvatars = useENSAvatars(provider, ENSNames)

  const { blockNumber, fetch: fetchBlockNumber } = useBlockNumber(false)
  const { balances, fetch: fetchBalances } = useBalances(false)

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
      console.debug('Failed to connect eagerly to walletConnect')
    })
  }, [])

  return (
    <Card
      walletLogoUrl="https://1000logos.net/wp-content/uploads/2022/05/WalletConnect-Logo.png"
      accountIndex={accountIndex}
      connector={walletConnect}
      chainId={chainId}
      isActivating={isActivating}
      isActive={isActive}
      ENSNames={ENSNames}
      ENSAvatars={ENSAvatars}
      provider={provider}
      accounts={accounts}
      blockNumber={blockNumber}
      balances={balances}
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
