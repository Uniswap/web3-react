import { hooks, walletLink } from '../../connectors/walletLink'
import { Accounts } from '../Accounts'
import { Card } from '../Card'
import { Chain } from '../Chain'
import { Connect } from '../Connect'
import { Status } from '../Status'

const { useChainId, useAccounts, useError, useIsActivating, useIsActive, useProvider, useENSNames } = hooks

export default function WalletLinkCard() {
  const chainId = useChainId()
  const accounts = useAccounts()
  const error = useError()
  const isActivating = useIsActivating()

  const isActive = useIsActive()

  const provider = useProvider()
  const ENSNames = useENSNames(provider)

  return (
    <Card>
      <div>
        <b>WalletLink</b>
        <Status isActivating={isActivating} error={error} isActive={isActive} />
        <div style={{ marginBottom: '1rem' }} />
        <Chain chainId={chainId} />
        <Accounts accounts={accounts} provider={provider} ENSNames={ENSNames} />
      </div>
      <div style={{ marginBottom: '1rem' }} />
      <Connect
        activate={() => walletLink.activate()}
        deactivate={() => walletLink.deactivate()}
        isActivating={isActivating}
        error={error}
        isActive={isActive}
      />
    </Card>
  )
}
