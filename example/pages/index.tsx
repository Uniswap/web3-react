import React from 'react'
import { AbstractConnector } from '@web3-react/abstract-connector'
import { Web3ReactProvider, useWeb3React, UnsupportedChainIdError } from '@web3-react/core'
import {
  NoEthereumProviderError,
  UserRejectedRequestError as UserRejectedRequestErrorInjected
} from '@web3-react/injected-connector'
import {
  URI_AVAILABLE,
  UserRejectedRequestError as UserRejectedRequestErrorWalletConnect
} from '@web3-react/walletconnect-connector'
import { UserRejectedRequestError as UserRejectedRequestErrorFrame } from '@web3-react/frame-connector'
import { Web3Provider } from '@ethersproject/providers'
import { formatEther } from '@ethersproject/units'

import { useEagerConnect, useInactiveListener } from '../hooks'
import {
  injected,
  network,
  walletconnect,
  walletlink,
  ledger,
  trezor,
  frame,
  authereum,
  fortmatic,
  portis,
  squarelink,
  torus
} from '../connectors'
import { Spinner } from '../components/Spinner'

const connectorsByName: { [name: string]: AbstractConnector } = {
  Injected: injected,
  Network: network,
  WalletConnect: walletconnect,
  WalletLink: walletlink,
  Ledger: ledger,
  Trezor: trezor,
  Frame: frame,
  Authereum: authereum,
  Fortmatic: fortmatic,
  Portis: portis,
  Squarelink: squarelink,
  Torus: torus
}

function getErrorMessage(error: Error) {
  if (error instanceof NoEthereumProviderError) {
    return 'No Ethereum browser extension detected, install MetaMask on desktop or visit from a dApp browser on mobile.'
  } else if (error instanceof UnsupportedChainIdError) {
    return "You're connected to an unsupported network."
  } else if (
    error instanceof UserRejectedRequestErrorInjected ||
    error instanceof UserRejectedRequestErrorWalletConnect ||
    error instanceof UserRejectedRequestErrorFrame
  ) {
    return 'Please authorize this website to access your Ethereum account.'
  } else {
    console.error(error)
    return 'An unknown error occurred. Check the console for more details.'
  }
}

function getLibrary(provider: any): Web3Provider {
  console.log('getting library')
  const library = new Web3Provider(provider)
  library.pollingInterval = 12000
  return library
}

export default function() {
  return (
    <Web3ReactProvider getLibrary={getLibrary}>
      <App />
    </Web3ReactProvider>
  )
}

function ChainId() {
  const { chainId } = useWeb3React()

  return (
    <>
      <span>Chain Id</span>
      <span role="img" aria-label="chain">
        ⛓
      </span>
      <span>{Number.isInteger(chainId) ? chainId : ''}</span>
    </>
  )
}

function BlockNumber() {
  const { chainId, library } = useWeb3React()

  const [blockNumber, setBlockNumber] = React.useState()
  React.useEffect((): any => {
    if (!!library) {
      let stale = false

      // console.log('updating block number')
      // console.log((window as any).ethereum)
      // console.log(library)
      library
        .getBlockNumber()
        .then((blockNumber: number) => {
          // console.log(blockNumber)
          if (!stale) {
            setBlockNumber(blockNumber)
          }
        })
        .catch(() => {
          if (!stale) {
            setBlockNumber(null)
          }
        })

      // const updateBlockNumber = (blockNumber: number) => {
      //   setBlockNumber(blockNumber)
      // }
      // library.on('block', updateBlockNumber)

      return () => {
        stale = true
        // library.removeListener('block', updateBlockNumber)
        setBlockNumber(undefined)
      }
    }
  }, [library, chainId]) // ensures refresh if referential identity of library doesn't change across chainIds

  return (
    <>
      <span>Block Number</span>
      <span role="img" aria-label="numbers">
        🔢
      </span>
      <span>
        {Number.isInteger(blockNumber)
          ? blockNumber.toLocaleString()
          : blockNumber === null
          ? 'Error'
          : !!library
          ? '...'
          : ''}
      </span>
    </>
  )
}

function Account() {
  const { account } = useWeb3React()

  return (
    <>
      <span>Account</span>
      <span role="img" aria-label="robot">
        🤖
      </span>
      <span>
        {account === undefined
          ? ''
          : account === null
          ? '-'
          : `${account.substring(0, 6)}...${account.substring(account.length - 4)}`}
      </span>
    </>
  )
}

function Balance() {
  const { account, library, chainId } = useWeb3React()

  const [balance, setBalance] = React.useState()
  React.useEffect((): any => {
    if (!!account && !!library) {
      let stale = false

      library
        .getBalance(account)
        .then((balance: any) => {
          if (!stale) {
            setBalance(balance)
          }
        })
        .catch(() => {
          if (!stale) {
            setBalance(null)
          }
        })

      return () => {
        stale = true
        setBalance(undefined)
      }
    }
  }, [account, library, chainId]) // ensures refresh if referential identity of library doesn't change across chainIds

  return (
    <>
      <span>Balance</span>
      <span role="img" aria-label="gold">
        💰
      </span>
      <span>
        {!!balance
          ? `Ξ${parseFloat(formatEther(balance)).toPrecision(4)}`
          : balance === null
          ? 'Error'
          : account === null
          ? '-'
          : !!account && !!library
          ? '...'
          : ''}
      </span>
    </>
  )
}

function Header() {
  const { active, error } = useWeb3React()

  return (
    <>
      <h1 style={{ margin: '1rem', textAlign: 'right' }}>{active ? '🟢' : error ? '🔴' : '🟠'}</h1>
      <h3
        style={{
          display: 'grid',
          gridGap: '1rem',
          gridTemplateColumns: '1fr min-content 1fr',
          maxWidth: '20rem',
          lineHeight: '2rem',
          margin: 'auto'
        }}
      >
        <ChainId />
        <BlockNumber />
        <Account />
        <Balance />
      </h3>
    </>
  )
}

function App() {
  const context = useWeb3React<Web3Provider>()
  const { connector, library, chainId, account, activate, deactivate, active, error } = context

  // handle logic to recognize the connector currently being activated
  const [activatingConnector, setActivatingConnector] = React.useState()
  React.useEffect(() => {
    if (activatingConnector && activatingConnector === connector) {
      setActivatingConnector(undefined)
    }
  }, [activatingConnector, connector])

  // handle logic to eagerly connect to the injected ethereum provider, if it exists and has granted access already
  const triedEager = useEagerConnect()

  // handle logic to connect in reaction to certain events on the injected ethereum provider, if it exists
  useInactiveListener(!triedEager || !!activatingConnector)

  return (
    <>
      <Header />
      <hr style={{ margin: '2rem' }} />
      <div
        style={{
          display: 'grid',
          gridGap: '1rem',
          gridTemplateColumns: '1fr 1fr',
          maxWidth: '20rem',
          margin: 'auto'
        }}
      >
        {Object.keys(connectorsByName).map(name => {
          const currentConnector = connectorsByName[name]
          const activating = currentConnector === activatingConnector
          const connected = currentConnector === connector
          const disabled = !triedEager || !!activatingConnector || connected || !!error

          return (
            <button
              style={{
                height: '3rem',
                borderRadius: '1rem',
                borderColor: activating ? 'orange' : connected ? 'green' : 'unset',
                cursor: disabled ? 'unset' : 'pointer',
                position: 'relative'
              }}
              disabled={disabled}
              key={name}
              onClick={() => {
                setActivatingConnector(currentConnector)
                activate(connectorsByName[name])
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  top: '0',
                  left: '0',
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  color: 'black',
                  margin: '0 0 0 1rem'
                }}
              >
                {activating && <Spinner color={'black'} style={{ height: '25%', marginLeft: '-1rem' }} />}
                {connected && (
                  <span role="img" aria-label="check">
                    ✅
                  </span>
                )}
              </div>
              {name}
            </button>
          )
        })}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        {(active || error) && (
          <button
            style={{
              height: '3rem',
              marginTop: '2rem',
              borderRadius: '1rem',
              borderColor: 'red',
              cursor: 'pointer'
            }}
            onClick={() => {
              deactivate()
            }}
          >
            Deactivate
          </button>
        )}

        {!!error && <h4 style={{ marginTop: '1rem', marginBottom: '0' }}>{getErrorMessage(error)}</h4>}
      </div>

      <hr style={{ margin: '2rem' }} />

      <div
        style={{
          display: 'grid',
          gridGap: '1rem',
          gridTemplateColumns: 'fit-content',
          maxWidth: '20rem',
          margin: 'auto'
        }}
      >
        {!!(library && account) && (
          <button
            style={{
              height: '3rem',
              borderRadius: '1rem',
              cursor: 'pointer'
            }}
            onClick={() => {
              library
                .getSigner(account)
                .signMessage('👋')
                .then((signature: any) => {
                  window.alert(`Success!\n\n${signature}`)
                })
                .catch((error: any) => {
                  window.alert('Failure!' + (error && error.message ? `\n\n${error.message}` : ''))
                })
            }}
          >
            Sign Message
          </button>
        )}
        {!!(connector === network && chainId) && (
          <button
            style={{
              height: '3rem',
              borderRadius: '1rem',
              cursor: 'pointer'
            }}
            onClick={() => {
              ;(connector as any).changeChainId(chainId === 1 ? 4 : 1)
            }}
          >
            Switch Networks
          </button>
        )}
        {connector === walletconnect && (
          <button
            style={{
              height: '3rem',
              borderRadius: '1rem',
              cursor: 'pointer'
            }}
            onClick={() => {
              ;(connector as any).close()
            }}
          >
            Kill WalletConnect Session
          </button>
        )}
        {connector === fortmatic && (
          <button
            style={{
              height: '3rem',
              borderRadius: '1rem',
              cursor: 'pointer'
            }}
            onClick={() => {
              ;(connector as any).close()
            }}
          >
            Kill Fortmatic Session
          </button>
        )}
        {connector === portis && (
          <>
            {chainId !== undefined && (
              <button
                style={{
                  height: '3rem',
                  borderRadius: '1rem',
                  cursor: 'pointer'
                }}
                onClick={() => {
                  ;(connector as any).changeNetwork(chainId === 1 ? 100 : 1)
                }}
              >
                Switch Networks
              </button>
            )}
            <button
              style={{
                height: '3rem',
                borderRadius: '1rem',
                cursor: 'pointer'
              }}
              onClick={() => {
                ;(connector as any).close()
              }}
            >
              Kill Portis Session
            </button>
          </>
        )}
        {connector === torus && (
          <button
            style={{
              height: '3rem',
              borderRadius: '1rem',
              cursor: 'pointer'
            }}
            onClick={() => {
              ;(connector as any).close()
            }}
          >
            Kill Torus Session
          </button>
        )}
      </div>
    </>
  )
}
