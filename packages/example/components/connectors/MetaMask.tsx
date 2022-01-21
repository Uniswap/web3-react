import { Web3ReactHooks } from '@web3-react/core'
import { useCallback, useState } from 'react'
import { CHAINS, getAddChainParameters, URLS } from '../../chains'
import { hooks, metaMask } from '../../connectors/metaMask'
import { Accounts } from '../Accounts'
import { Card } from '../Card'
import { Chain } from '../Chain'
import { Status } from '../Status'

const { useChainId, useAccounts, useError, useIsActivating, useIsActive, useProvider, useENSNames } = hooks

function Select({ chainId, switchChain }: { chainId: number; switchChain?: (chainId: number) => void }) {
  return (
    <select
      value={chainId}
      onChange={(event) => {
        switchChain?.(Number(event.target.value))
      }}
      disabled={switchChain === undefined}
    >
      <option value={-1}>Default Chain</option>
      {Object.keys(URLS).map((chainId) => (
        <option key={chainId} value={Number(chainId)}>
          {CHAINS[Number(chainId)]?.name}
        </option>
      ))}
    </select>
  )
}

function Connect({
  chainId,
  isActivating,
  error,
  isActive,
}: {
  chainId: ReturnType<Web3ReactHooks['useChainId']>
  isActivating: ReturnType<Web3ReactHooks['useIsActivating']>
  error: ReturnType<Web3ReactHooks['useError']>
  isActive: ReturnType<Web3ReactHooks['useIsActive']>
}) {
  const [desiredChainId, setDesiredChainId] = useState<number>(-1)

  const switchChain = useCallback(
    async (desiredChainId: number) => {
      setDesiredChainId(desiredChainId)
      if (desiredChainId !== -1 && desiredChainId !== chainId) {
        await metaMask.activate(getAddChainParameters(desiredChainId))
      }
    },
    [chainId]
  )

  if (error) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <Select chainId={desiredChainId} switchChain={switchChain} />
        <div style={{ marginBottom: '1rem' }} />
        <button
          onClick={() => metaMask.activate(desiredChainId === -1 ? undefined : getAddChainParameters(desiredChainId))}
        >
          Try Again?
        </button>
      </div>
    )
  } else if (isActive) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <Select chainId={desiredChainId === -1 ? -1 : chainId} switchChain={switchChain} />
        <div style={{ marginBottom: '1rem' }} />
        <button onClick={() => metaMask.deactivate()}>Disconnect</button>
      </div>
    )
  } else {
    return (
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <Select chainId={desiredChainId} switchChain={isActivating ? undefined : switchChain} />
        <div style={{ marginBottom: '1rem' }} />
        <button
          onClick={
            isActivating
              ? undefined
              : () => metaMask.activate(desiredChainId === -1 ? undefined : getAddChainParameters(desiredChainId))
          }
          disabled={isActivating}
        >
          Connect
        </button>
      </div>
    )
  }
}

export default function MetaMaskCard() {
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
        <b>MetaMask</b>
        <Status isActivating={isActivating} error={error} isActive={isActive} />
        <div style={{ marginBottom: '1rem' }} />
        <Chain chainId={chainId} />
        <Accounts accounts={accounts} provider={provider} ENSNames={ENSNames} />
      </div>
      <div style={{ marginBottom: '1rem' }} />
      <Connect chainId={chainId} isActivating={isActivating} error={error} isActive={isActive} />
    </Card>
  )
}
