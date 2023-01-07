import type { JsonRpcProvider } from '@ethersproject/providers'
import { useState } from 'react'
import { useTimeout } from '../hooks/hooks'
import { Button } from './Button'
import Spacer from './Spacer'

export default function SignerButton({ provider, account }: { provider?: JsonRpcProvider; account?: string }) {
  const [isPendingSignature, setIsPendingSignature] = useState(false)

  const { start, isTimedOut } = useTimeout({
    startOnMount: false,
    timeout: 1_000,
  })

  const signIt = () => {
    if (!provider || !account) return
    setIsPendingSignature(true)

    const signer = provider.getSigner(account)
    signer
      .signMessage('Sign me!')
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
      <Button disabled={isPendingSignature || isTimedOut} onClick={signIt}>
        {isPendingSignature ? 'Pending Signature...' : isTimedOut ? 'Message Signed!' : 'Sign Message'}
      </Button>
    </>
  )
}
