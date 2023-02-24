import { URI_AVAILABLE } from '@web3-react/walletconnect'
import { useEffect, useState } from 'react'

import { MAINNET_CHAINS } from '../../chains'
import { hooks, walletConnect } from '../../connectors/walletConnect'
import { Card } from '../Card'

const CHAIN_IDS = Object.keys(MAINNET_CHAINS).map(Number)

const { useChainId, useAccounts, useIsActivating, useIsActive, useProvider, useENSNames } = hooks

export default function WalletConnectCard() {
  const chainId = useChainId()
  const accounts = useAccounts()
  const isActivating = useIsActivating()

  const isActive = useIsActive()

  const provider = useProvider()
  const ENSNames = useENSNames(provider)

  const [error, setError] = useState(undefined)

  // log URI when available
  useEffect(() => {
    walletConnect.events.on(URI_AVAILABLE, (uri: string) => {
      console.log(`uri: ${uri}`)
    })
  }, [])

  // attempt to connect eagerly on mount
  useEffect(() => {
    walletConnect.connectEagerly().catch((error) => {
      console.debug('Failed to connect eagerly to walletconnect', error)
    })
  }, [])

  return (
    <Card
      connector={walletConnect}
      activeChainId={chainId}
      chainIds={CHAIN_IDS}
      isActivating={isActivating}
      isActive={isActive}
      error={error}
      setError={setError}
      accounts={accounts}
      provider={provider}
      ENSNames={ENSNames}
    />
  )
}
