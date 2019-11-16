import 'regenerator-runtime/runtime'
import 'react-app-polyfill/ie11'
import * as React from 'react'
import * as ReactDOM from 'react-dom'
import { AbstractConnectorInterface } from '@web3-react/types'
import { Web3ReactProvider, useWeb3React, UnsupportedChainIdError } from '@web3-react/core'
import {
  NoEthereumProviderError,
  UserRejectedRequestError as UserRejectedRequestErrorInjected
} from '@web3-react/injected-connector'
import {
  URI_AVAILABLE,
  UserRejectedRequestError as UserRejectedRequestErrorWalletConnect
} from '@web3-react/walletconnect-connector'
import { Web3Provider } from '@ethersproject/providers'
import { formatEther } from '@ethersproject/units'

import { injected, walletconnect, walletlink, network, fortmatic, portis } from './connectors'
import { useEagerConnect, useInactiveListener } from './hooks'
import { Spinner } from './Spinner'

const connectorsByName: { [name: string]: AbstractConnectorInterface } = {
  Injected: injected,
  WalletConnect: walletconnect,
  WalletLink: walletlink,
  Network: network,
  Fortmatic: fortmatic,
  Portis: portis
}

function getErrorMessage(error: Error) {
  if (error instanceof NoEthereumProviderError) {
    return 'No Ethereum browser extension detected, install MetaMask on desktop or visit from a dApp browser on mobile.'
  } else if (error instanceof UnsupportedChainIdError) {
    return "You're connected to an unsupported network."
  } else if (
    error instanceof UserRejectedRequestErrorInjected ||
    error instanceof UserRejectedRequestErrorWalletConnect
  ) {
    return 'Please authorize this website to access your Ethereum account.'
  } else {
    console.error(error)
    return 'An unknown error occurred. Check the console for more details.'
  }
}

function getLibrary(provider: any): Web3Provider {
  const library = new Web3Provider(provider)
  library.pollingInterval = 8000
  return library
}

function App() {
  return (
    <Web3ReactProvider getLibrary={getLibrary}>
      <MyComponent />
    </Web3ReactProvider>
  )
}

function MyComponent() {
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

  // set up block listener
  const [blockNumber, setBlockNumber] = React.useState()
  React.useEffect((): any => {
    if (library) {
      let stale = false

      library
        .getBlockNumber()
        .then((blockNumber: number) => {
          if (!stale) {
            setBlockNumber(blockNumber)
          }
        })
        .catch(() => {
          if (!stale) {
            setBlockNumber(null)
          }
        })

      const updateBlockNumber = (blockNumber: number) => {
        setBlockNumber(blockNumber)
      }
      library.on('block', updateBlockNumber)

      return () => {
        library.removeListener('block', updateBlockNumber)
        stale = true
        setBlockNumber(undefined)
      }
    }
  }, [library, chainId])

  // fetch eth balance of the connected account
  const [ethBalance, setEthBalance] = React.useState()
  React.useEffect((): any => {
    if (library && account) {
      let stale = false

      library
        .getBalance(account)
        .then((balance: any) => {
          if (!stale) {
            setEthBalance(balance)
          }
        })
        .catch(() => {
          if (!stale) {
            setEthBalance(null)
          }
        })

      return () => {
        stale = true
        setEthBalance(undefined)
      }
    }
  }, [library, account, chainId])

  // log the walletconnect URI
  React.useEffect(() => {
    const logURI = (uri: any) => {
      console.log('WalletConnect URI', uri)
    }
    walletconnect.on(URI_AVAILABLE, logURI)

    return () => {
      walletconnect.off(URI_AVAILABLE, logURI)
    }
  }, [])

  return (
    <div style={{ padding: '1rem' }}>
      <h1 style={{ margin: '0', textAlign: 'right' }}>{active ? '🟢' : error ? '🔴' : '🟠'}</h1>
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
        <span>Chain Id</span>
        <span role='img' aria-label='chain'>
          ⛓
        </span>
        <span>{chainId === undefined ? '...' : chainId}</span>

        <span>Block Number</span>
        <span role='img' aria-label='numbers'>
          🔢
        </span>
        <span>{blockNumber === undefined ? '...' : blockNumber === null ? 'Error' : blockNumber.toLocaleString()}</span>

        <span>Account</span>
        <span role='img' aria-label='robot'>
          🤖
        </span>
        <span>
          {account === undefined
            ? '...'
            : account === null
            ? 'None'
            : `${account.substring(0, 6)}...${account.substring(account.length - 4)}`}
        </span>

        <span>Balance</span>
        <span role='img' aria-label='gold'>
          💰
        </span>
        <span>
          {ethBalance === undefined
            ? '...'
            : ethBalance === null
            ? 'Error'
            : `Ξ${parseFloat(formatEther(ethBalance)).toPrecision(4)}`}
        </span>
      </h3>
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
                  <span role='img' aria-label='check'>
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
                .then(signature => {
                  window.alert(`Success!\n\n${signature}`)
                })
                .catch(error => {
                  window.alert('Failure!' + (error && error.message ? `\n\n${error.message}` : ''))
                })
            }}
          >
            Sign Message
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
      </div>
    </div>
  )
}

ReactDOM.render(<App />, document.getElementById('root'))
