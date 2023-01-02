import type { CoinbaseWallet } from '@web3-react/coinbase-wallet'
import { useWeb3React, Web3ReactHooks } from '@web3-react/core'
import { GnosisSafe } from '@web3-react/gnosis-safe'
import type { MetaMask } from '@web3-react/metamask'
import { Network } from '@web3-react/network'
import type { AddingChainInfo, SwitchingChainInfo } from '@web3-react/types'
import { WalletConnect } from '@web3-react/walletconnect'
import { useCallback, useState } from 'react'
import { CHAINS, getAddChainParameters, URLS } from '../utils/chains'
import { Button } from './Button'

function ChainSelect({
  chainId,
  switchChain,
  displayDefault,
  chainIds,
  isPendingChainAdd,
  isPendingChainSwitch,
}: {
  chainId: number
  switchChain: (chainId: number) => void | undefined
  displayDefault: boolean
  chainIds: number[]
  isPendingChainAdd: boolean
  isPendingChainSwitch: boolean
}) {
  const disabled = switchChain === undefined || isPendingChainAdd || isPendingChainSwitch

  return (
    <select
      style={{
        opacity: disabled ? 0.3 : 1,
        cursor: disabled ? 'auto' : 'pointer',
        height: '34px',
        borderRadius: '17px',
        paddingLeft: '8px',
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        borderColor: 'black',
      }}
      value={chainId}
      onChange={(event) => {
        switchChain?.(Number(event.target.value))
      }}
      disabled={disabled}
    >
      {displayDefault ? <option value={-1}>Default Chain</option> : null}
      {chainIds.map((chainId) => (
        <option key={chainId} value={chainId}>
          {CHAINS[chainId]?.name ?? chainId}
        </option>
      ))}
    </select>
  )
}

export function ConnectWithSelect({
  connector,
  chainId,
  isActivating,
  isActive,
  error,
  setError,
  isSelected,
  addingChain,
  switchingChain,
}: {
  connector: MetaMask | WalletConnect | CoinbaseWallet | Network | GnosisSafe
  chainId: ReturnType<Web3ReactHooks['useChainId']>
  isActivating: ReturnType<Web3ReactHooks['useIsActivating']>
  isActive: ReturnType<Web3ReactHooks['useIsActive']>
  error: Error | undefined
  setError: (error: Error | undefined) => void
  isSelected?: boolean
  addingChain?: AddingChainInfo
  switchingChain?: SwitchingChainInfo
}) {
  const { setSelectedConnector } = useWeb3React()

  const isNetwork = connector instanceof Network
  const displayDefault = !isNetwork
  const chainIds = (isNetwork ? Object.keys(URLS) : Object.keys(CHAINS)).map((chainId) => Number(chainId))

  const [desiredChainId, setDesiredChainId] = useState<number>(isNetwork ? 1 : -1)

  const switchChain = useCallback(
    (desiredChainId: number) => {
      setDesiredChainId(desiredChainId)
      // if we're already connected to the desired chain, return
      if (desiredChainId === chainId) {
        setError(undefined)
        return
      }

      // if they want to connect to the default chain and we're already connected, return
      if (desiredChainId === -1 && chainId !== undefined) {
        setError(undefined)
        return
      }

      if (connector instanceof WalletConnect || connector instanceof Network) {
        connector
          .activate(desiredChainId === -1 ? undefined : desiredChainId)
          .then(() => setError(undefined))
          .catch(setError)
      } else {
        connector
          .activate(desiredChainId === -1 ? undefined : getAddChainParameters(desiredChainId))
          .then(() => setError(undefined))
          .catch(setError)
      }
    },
    [connector, chainId, setError]
  )

  const onClick = useCallback((): void => {
    setError(undefined)
    if (connector instanceof GnosisSafe) {
      connector
        .activate()
        .then(() => setError(undefined))
        .catch(setError)
    } else if (connector instanceof WalletConnect || connector instanceof Network) {
      connector
        .activate(desiredChainId === -1 ? undefined : desiredChainId)
        .then(() => setError(undefined))
        .catch(setError)
    } else {
      connector
        .activate(desiredChainId === -1 ? undefined : getAddChainParameters(desiredChainId))
        .then(() => setError(undefined))
        .catch(setError)
    }
  }, [connector, desiredChainId, setError])

  if (error) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-start' }}>
        {!(connector instanceof GnosisSafe) && (
          <ChainSelect
            chainId={desiredChainId}
            switchChain={switchChain}
            displayDefault={displayDefault}
            chainIds={chainIds}
            isPendingChainAdd={!!addingChain}
            isPendingChainSwitch={!!switchingChain}
          />
        )}
        <div style={{ marginBottom: '1rem' }} />
        <Button
          style={{
            borderColor: 'rgba(253, 246, 56, 0.4)',
            backgroundColor: 'rgba(253, 246, 56, 0.15)',
          }}
          disabled={isActivating || !!addingChain || !!switchingChain}
          onClick={onClick}
        >
          Try Again?
        </Button>
      </div>
    )
  } else if (isActive) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-start' }}>
        {!(connector instanceof GnosisSafe) && (
          <ChainSelect
            chainId={desiredChainId === -1 ? -1 : chainId}
            switchChain={switchChain}
            displayDefault={displayDefault}
            chainIds={chainIds}
            isPendingChainAdd={!!addingChain}
            isPendingChainSwitch={!!switchingChain}
          />
        )}
        <div style={{ marginBottom: '1rem' }} />
        <Button
          style={{
            marginBottom: '1rem',
            borderColor: 'rgba(253, 56, 56, 0.4)',
            backgroundColor: 'rgba(253, 56, 56, 0.15)',
          }}
          onClick={() => {
            if (connector?.deactivate) {
              void connector.deactivate()
            } else {
              void connector.resetState()
            }
          }}
        >
          Disconnect
        </Button>
        <Button
          style={{
            borderColor: 'rgba(168, 56, 253, 0.4)',
            backgroundColor: 'rgba(168, 56, 253, 0.15)',
          }}
          onClick={() => setSelectedConnector(connector)}
          disabled={isSelected}
        >
          Select
        </Button>
      </div>
    )
  } else {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-start' }}>
        {!(connector instanceof GnosisSafe) && (
          <ChainSelect
            chainId={desiredChainId}
            switchChain={isActivating ? undefined : switchChain}
            displayDefault={displayDefault}
            chainIds={chainIds}
            isPendingChainAdd={!!addingChain}
            isPendingChainSwitch={!!switchingChain}
          />
        )}
        <div style={{ marginBottom: '1rem' }} />
        <Button
          style={{
            marginBottom: '1rem',
            borderColor: 'rgba(56, 253, 72, 0.4)',
            backgroundColor: 'rgba(56, 253, 72, 0.15)',
          }}
          onClick={
            isActivating
              ? undefined
              : () =>
                  connector instanceof GnosisSafe
                    ? void connector
                        .activate()
                        .then(() => setError(undefined))
                        .catch(setError)
                    : connector instanceof WalletConnect || connector instanceof Network
                    ? connector
                        .activate(desiredChainId === -1 ? undefined : desiredChainId)
                        .then(() => setError(undefined))
                        .catch(setError)
                    : connector
                        .activate(desiredChainId === -1 ? undefined : getAddChainParameters(desiredChainId))
                        .then(() => setError(undefined))
                        .catch(setError)
          }
          disabled={isActivating}
        >
          Connect
        </Button>
        <Button
          style={{
            borderColor: 'rgba(168, 56, 253, 0.4)',
            backgroundColor: 'rgba(168, 56, 253, 0.15)',
          }}
          onClick={() => setSelectedConnector(connector)}
          disabled={isSelected}
        >
          Select
        </Button>
      </div>
    )
  }
}
