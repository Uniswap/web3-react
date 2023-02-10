import { URI_AVAILABLE } from '@web3-react/walletconnect'
import { useEffect, useState } from 'react'

import { hooks, walletConnect } from '../../../config/connectors/walletConnect'
import { Card } from '../Card'

const {
  useChainId,
  useAccounts,
  useAccountIndex,
  useIsActivating,
  useIsActive,
  useProvider,
  useENSNames,
  useENSAvatars,
} = hooks

export default function WalletConnectCard({ hide }: { hide: boolean }) {
  const chainId = useChainId()
  const accounts = useAccounts()
  const accountIndex = useAccountIndex()
  const isActivating = useIsActivating()
  const isActive = useIsActive()
  const provider = useProvider()
  const ENSNames = useENSNames(provider)
  const ENSAvatars = useENSAvatars(provider, ENSNames)

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
      hide={hide}
      accountIndex={accountIndex}
      connector={walletConnect}
      chainId={chainId}
      isActivating={isActivating}
      isActive={isActive}
      ENSNames={ENSNames}
      ENSAvatars={ENSAvatars}
      provider={provider}
      accounts={accounts}
      error={error}
      setError={setError}
    />
  )
}
