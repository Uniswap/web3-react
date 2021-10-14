import { Connector } from '@web3-react/types'
import { connectors } from '../connectors'
import { Web3ReactHooks } from '@web3-react/core'
import { useEffect, useState } from 'react'
import { BigNumber } from '@ethersproject/bignumber'
import { formatEther } from '@ethersproject/units'
import { Magic } from '@web3-react/magic'
import { Network } from '@web3-react/network'

function Status({
  connector,
  hooks: { useChainId, useAccounts, useError },
}: {
  connector: Connector
  hooks: Web3ReactHooks
}) {
  const chainId = useChainId()
  const accounts = useAccounts()
  const error = useError()

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

function ChainId({ hooks: { useChainId } }: { hooks: Web3ReactHooks }) {
  const chainId = useChainId()

  return <div>Chain Id: {chainId ? <b>{chainId}</b> : '-'}</div>
}

function useBalances(
  provider?: ReturnType<Web3ReactHooks['useProvider']>,
  accounts?: string[]
): BigNumber[] | undefined {
  const [balances, setBalances] = useState<BigNumber[] | undefined>()

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
  }, [provider, accounts])

  return balances
}

function Accounts({ hooks: { useAccounts, useProvider, useENSNames } }: { hooks: Web3ReactHooks }) {
  const accounts = useAccounts()
  const ENSNames = useENSNames()

  const provider = useProvider()

  const balances = useBalances(provider, accounts)

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

function Connect({
  connector,
  hooks: { useChainId, useIsActivating, useError, useIsActive },
}: {
  connector: Connector
  hooks: Web3ReactHooks
}) {
  const chainId = useChainId()
  const isActivating = useIsActivating()
  const error = useError()

  const active = useIsActive()

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
  } else if (active) {
    return (
      <>
        {connector instanceof Network ? (
          <label>
            Network:
            <select value={`${chainId}`} onChange={(event) => connector.activate(Number(event.target.value))}>
              <option value="1">Mainnet</option>
              <option value="3">Ropsten</option>
              <option value="4">Rinkeby</option>
              <option value="5">Görli</option>
              <option value="42">Kovan</option>
              <option value="10">Optimism</option>
              <option value="42161">Arbitrum</option>
            </select>
          </label>
        ) : null}
        <button
          onClick={() => {
            if (connector.deactivate) {
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
            if (!isActivating) {
              connector.activate(...activateArgs)
            }
          }}
          disabled={isActivating ? true : false}
        >
          {isActivating ? 'Connecting...' : 'Activate'}
        </button>
      </>
    )
  }
}

export function Connectors() {
  return (
    <div style={{ display: 'flex', flexFlow: 'wrap', fontFamily: 'sans-serif' }}>
      {connectors.map(([connector, hooks], i) => (
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
            <Status connector={connector} hooks={hooks} />
            <br />
            <ChainId hooks={hooks} />
            <Accounts hooks={hooks} />
            <br />
          </div>
          <Connect connector={connector} hooks={hooks} />
        </div>
      ))}
    </div>
  )
}
