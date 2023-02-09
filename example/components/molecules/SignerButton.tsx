import type { Web3Provider } from '@ethersproject/providers'
import type { Connector } from '@web3-react/types'
import { useTimeout } from '../../hooks/hooks'
import { useSignMessage } from '../../hooks/web3Hooks'
import Button from '../atoms/Button'
import SpacerView from '../atoms/SpacerView'

export default function SignerButton({
  connector,
  provider,
  account,
}: {
  connector?: Connector
  provider?: Web3Provider
  account?: string
}) {
  const { start, isTimedOut } = useTimeout({
    startOnMount: false,
    timeout: 1_000,
  })

  const { signMessage, isLoading } = useSignMessage({ connector, provider, account, onSigned: start })

  return (
    <>
      <SpacerView />
      <Button disabled={isLoading || isTimedOut} onClick={() => void signMessage()}>
        {isLoading ? 'Pending Signature...' : isTimedOut ? 'Message Signed!' : 'Sign Message'}
      </Button>
    </>
  )
}
