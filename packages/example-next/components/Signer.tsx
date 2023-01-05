import type { JsonRpcProvider } from '@ethersproject/providers'
import { useState } from 'react'
import { useTimeout } from '../hooks/hooks'
import { Button } from './Button'
import Spacer from './Spacer'

export default function Signer({ provider, account }: { provider?: JsonRpcProvider; account?: string }) {
  const [isPendingSignature, setIsPendingSignature] = useState(false)

  const { start, isTimedOut } = useTimeout({
    startOnMount: false,
    timeout: 2_000,
  })

  const signIt = () => {
    if (!provider || !account) return
    setIsPendingSignature(true)

    const signer = provider.getSigner()
    signer
      .signMessage('Signer Example')
      .then(() => {
        start()
        setIsPendingSignature(false)
      })
      .catch(() => {
        setIsPendingSignature(false)
      })
  }

  return (
    <>
      <Spacer />
      <Button disabled={isPendingSignature} onClick={signIt}>
        {isPendingSignature ? 'Pending Signature...' : isTimedOut ? 'Message Signed!' : 'Sign Message'}
      </Button>
    </>
  )
}
