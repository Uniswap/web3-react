import { UseStore } from 'zustand/esm'
import { Connector, Web3ReactState } from '@web3-react/types'
import { connectors } from '../connectors'
import { useChainId, useAccounts, useENSNames, useError, useActivating, useProvider } from '@web3-react/core'
import { useEffect, useState } from 'react'
import { BigNumber } from '@ethersproject/bignumber'
import { formatEther } from '@ethersproject/units'
import { Magic } from '@web3-react/magic'
import { Network } from '@web3-react/network'

function Status({
  connector,
  useConnector,
}: {
  connector: InstanceType<typeof Connector>
  useConnector: UseStore<Web3ReactState>
}) {
  const chainId = useChainId(useConnector)
  const accounts = useAccounts(useConnector)
  const error = useError(useConnector)

  const connected = Boolean(chainId && accounts)

  return (
    <div>
      <b>{connector.constructor.name}</b>
      <br />
      {error ? (
        <>
          🛑 {error.name ?? 'Error'}: {error.message}
        </>
      ) : connected ? (
        <>✅ Connected</>
      ) : (
        <>⚠️ Disconnected</>
      )}
    </div>
  )
}

function ChainId({ useConnector }: { useConnector: UseStore<Web3ReactState> }) {
  const chainId = useChainId(useConnector)

  return <div>Chain Id: {chainId ? <b>{chainId}</b> : '-'}</div>
}

function Accounts({
  connector,
  useConnector,
}: {
  connector: InstanceType<typeof Connector>
  useConnector: UseStore<Web3ReactState>
}) {
  const accounts = useAccounts(useConnector)
  const ENSNames = useENSNames(connector, useConnector)

  const provider = useProvider(connector, useConnector)
  const [balances, setBalances] = useState<BigNumber[] | undefined>(undefined)
  useEffect(() => {
    if (provider && accounts?.length) {
      let stale = false

      Promise.all(accounts.map((account) => provider.getBalance(account))).then((balances) => {
        if (!stale) {
          setBalances(balances)
        }
      })

      return () => {
        stale = true
        setBalances(undefined)
      }
    }
  }, [accounts])

  return (
    <div>
      Accounts:
      {accounts === undefined
        ? ' -'
        : accounts.length === 0
        ? ' None'
        : accounts?.map((account, i) => (
            <ul key={account} style={{ margin: 0, overflow: 'hidden', textOverflow: 'ellipsis' }}>
              <b>{ENSNames?.[i] ?? account}</b>
              {balances?.[i] ? ` (Ξ${formatEther(balances[i])})` : null}
            </ul>
          ))}
    </div>
  )
}

function Connect({ connector, useConnector }: { connector: Connector; useConnector: UseStore<Web3ReactState> }) {
  const activating = useActivating(useConnector)
  const error = useError(useConnector)

  const chainId = useChainId(useConnector)
  const accounts = useAccounts(useConnector)
  const connected = Boolean(chainId && accounts)

  const [activateArgs, setActivateArgs] = useState<any[]>([])

  if (error) {
    return (
      <button
        onClick={() => {
          connector.activate()
        }}
      >
        Try Again?
      </button>
    )
  } else if (connected) {
    return (
      <>
        {connector instanceof Network ? (
          <label>
            Network:
            <select value={`${chainId}`} onChange={(event) => connector.activate(Number(event.target.value))}>
              <option value="1">Mainnet</option>
              <option value="3">Ropsten</option>
              <option value="4">Rinkeby</option>
              <option value="42">Kovan</option>
              <option value="10">Optimism</option>
              <option value="42161">Arbitrum</option>
            </select>
          </label>
        ) : null}
        <button
          onClick={() => {
            if (connector?.deactivate) {
              connector.deactivate()
            }
          }}
          disabled={connector.deactivate ? false : true}
        >
          {connector.deactivate ? 'Disconnect' : 'Connected'}
        </button>
      </>
    )
  } else {
    return (
      <>
        {connector instanceof Magic ? (
          <label>
            Email:{' '}
            <input type="email" name="email" onChange={(event) => setActivateArgs([{ email: event.target.value }])} />
          </label>
        ) : null}
        <button
          onClick={() => {
            if (!activating) {
              connector.activate(...activateArgs)
            }
          }}
          disabled={activating ? true : false}
        >
          {activating ? 'Connecting...' : 'Activate'}
        </button>
      </>
    )
  }
}

export function Connectors() {
  return (
    <div style={{ display: 'flex', flexFlow: 'wrap', fontFamily: 'sans-serif' }}>
      {connectors.map(([connector, useConnector], i) => (
        <div
          key={i}
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            width: '20rem',
            padding: '1rem',
            margin: '1rem',
            overflow: 'auto',
            border: '1px solid',
            borderRadius: '1rem',
          }}
        >
          <div>
            <Status connector={connector} useConnector={useConnector} />
            <br />
            <ChainId useConnector={useConnector} />
            <Accounts connector={connector} useConnector={useConnector} />
            <br />
          </div>
          <Connect connector={connector} useConnector={useConnector} />
        </div>
      ))}
    </div>
  )
}
