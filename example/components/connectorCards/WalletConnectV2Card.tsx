import { _TypedDataEncoder } from '@ethersproject/hash'
import { AllowanceTransfer, MaxAllowanceTransferAmount, PERMIT2_ADDRESS, PermitSingle } from '@uniswap/permit2-sdk'
import { UNIVERSAL_ROUTER_ADDRESS } from '@uniswap/universal-router-sdk'
import { URI_AVAILABLE } from '@web3-react/walletconnect-v2'
import { useCallback, useEffect, useState } from 'react'

import { MAINNET_CHAINS } from '../../chains'
import { hooks, walletConnectV2 } from '../../connectors/walletConnectV2'
import { Card } from '../Card'

interface Permit extends PermitSingle {
  sigDeadline: number
}

// 30 days in milliseconds
const PERMIT_EXPIRATION = 1000 * 60 * 60 * 24 * 30
// 30 minutes in milliseconds
const PERMIT_SIG_EXPIRATION = 1000 * 60 * 30

function toDeadline(expiration: number): number {
  return Math.floor((Date.now() + expiration) / 1000)
}

const CHAIN_IDS = Object.keys(MAINNET_CHAINS).map(Number)

const { useChainId, useAccounts, useIsActivating, useIsActive, useProvider, useENSNames } = hooks

export default function WalletConnectV2Card() {
  const chainId = useChainId()
  const accounts = useAccounts()
  const isActivating = useIsActivating()

  const isActive = useIsActive()

  const provider = useProvider()
  const ENSNames = useENSNames(provider)

  const [error, setError] = useState(undefined)

  // log URI when available
  useEffect(() => {
    walletConnectV2.events.on(URI_AVAILABLE, (uri: string) => {
      console.log(`uri: ${uri}`)
    })
  }, [])

  // attempt to connect eagerly on mount
  useEffect(() => {
    walletConnectV2.connectEagerly().catch((error) => {
      console.debug('Failed to connect eagerly to walletconnect', error)
    })
  }, [])

  const signMessage = useCallback(async () => {
    if (!provider) {
      return
    }
    const permit: Permit = {
      details: {
        token: '0x1f9840a85d5af5bf1d1762f925bdaddc4201f984', // UNI mainnet
        amount: MaxAllowanceTransferAmount,
        expiration: toDeadline(PERMIT_EXPIRATION),
        nonce: 100, // high number to not conflict with current allowance
      },
      spender: UNIVERSAL_ROUTER_ADDRESS(chainId),
      sigDeadline: toDeadline(PERMIT_SIG_EXPIRATION),
    }
    console.log(provider.getSigner())
    const { domain, types, values } = AllowanceTransfer.getPermitData(permit, PERMIT2_ADDRESS, chainId)
    const address = (await provider.getSigner().getAddress()).toLowerCase()
    const message = JSON.stringify(_TypedDataEncoder.getPayload(domain, types, values))
    const signature = await await provider.getSigner().provider.send('eth_signTypedData', [address, message])

    console.log(`signature: ${signature}`)
  }, [chainId, provider])

  return (
    <>
      <Card
        connector={walletConnectV2}
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
      <button onClick={signMessage}>test signature</button>
    </>
  )
}
