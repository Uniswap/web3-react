import { useCallback, useState } from 'react'

import type { AddingChainInfo, SwitchingChainInfo } from '@web3-react/types'
import { useWeb3React, Web3ReactHooks } from '@web3-react/core'

import { MetaMask } from '@web3-react/metamask'
import { CoinbaseWallet } from '@web3-react/coinbase-wallet'
import { WalletConnect } from '@web3-react/walletconnect'
import { PortisWallet } from '@web3-react/portis-wallet'
import { Network } from '@web3-react/network'

import { ethMainChainId } from '../config/chains/chainIds'
import { CHAINS, getAddChainParameters } from '../utils/chains'
import { ConnectorType } from '../utils/connectors'

import Button from './Button'
import Spacer from './Spacer'

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
        marginBottom: '1rem',
      }}
      value={chainId}
      onChange={(event) => {
        switchChain?.(Number(event.target.value))
      }}
      disabled={disabled}
    >
      {!chainId && displayDefault ? <option value={-1}>Select Network</option> : null}
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
  connector: ConnectorType
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

  const isSwitchableNetwork =
    connector instanceof MetaMask ||
    connector instanceof CoinbaseWallet ||
    connector instanceof PortisWallet ||
    connector instanceof WalletConnect ||
    connector instanceof Network
  const isAddableNetwork = connector instanceof MetaMask || connector instanceof CoinbaseWallet

  const isNetwork = connector instanceof Network
  const displayDefault = !isNetwork
  const chainIds = connector?.supportedChainIds ?? Object.keys(CHAINS).map((chainId) => Number(chainId))

  const [desiredChainId, setDesiredChainId] = useState<number>(isNetwork ? ethMainChainId : chainId)

  const handleConnect = useCallback(
    (potentialChainId?: number): void => {
      if (isActivating) return

      const chain = potentialChainId ?? desiredChainId

      if (isSwitchableNetwork && isAddableNetwork) {
        connector
          .activate(chain === -1 ? undefined : getAddChainParameters(chain))
          .then(() => setError(undefined))
          .catch(setError)
      } else if (isSwitchableNetwork) {
        connector
          .activate(chain === -1 ? undefined : chain)
          .then(() => setError(undefined))
          .catch(setError)
      } else {
        connector
          .activate()
          .then(() => setError(undefined))
          .catch(setError)
      }
    },
    [connector, desiredChainId, isActivating, isAddableNetwork, isSwitchableNetwork, setError]
  )

  const handleSwitchChain = useCallback(
    (potentialChainId: number) => {
      setDesiredChainId(potentialChainId)

      // if we're already connected to the desired chain, return
      if (potentialChainId === chainId) {
        setError(undefined)
        return
      }

      // if they want to connect to the default chain and we're already connected, return
      if (potentialChainId === -1 && chainId !== undefined) {
        setError(undefined)
        return
      }

      handleConnect(potentialChainId)
    },
    [chainId, handleConnect, setError]
  )

  const handleTryAgain = useCallback((): void => {
    setError(undefined)
    handleConnect()
  }, [handleConnect, setError])

  return (
    <>
      <Spacer />
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-start' }}>
        {isSwitchableNetwork && (
          <ChainSelect
            chainId={desiredChainId}
            switchChain={handleSwitchChain}
            displayDefault={displayDefault}
            chainIds={chainIds}
            isPendingChainAdd={!!addingChain}
            isPendingChainSwitch={!!switchingChain}
          />
        )}

        {error ? (
          <Button
            style={{
              marginBottom: '1rem',
              borderColor: 'rgba(253, 246, 56, 0.4)',
              backgroundColor: 'rgba(253, 246, 56, 0.15)',
            }}
            disabled={isActivating || !!addingChain || !!switchingChain}
            onClick={handleTryAgain}
          >
            Try Again?
          </Button>
        ) : isActive ? (
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
        ) : (
          <Button
            style={{
              marginBottom: '1rem',
              borderColor: 'rgba(56, 253, 72, 0.4)',
              backgroundColor: 'rgba(56, 253, 72, 0.15)',
            }}
            onClick={() => handleConnect()}
            disabled={isActivating}
          >
            Connect
          </Button>
        )}

        <Button
          style={{
            borderColor: 'rgba(168, 56, 253, 0.4)',
            backgroundColor: 'rgba(168, 56, 253, 0.15)',
          }}
          onClick={() => setSelectedConnector(connector)}
          disabled={isSelected}
        >
          {isSelected ? 'Selected' : 'Select'}
        </Button>
      </div>
    </>
  )
}
