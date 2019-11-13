import 'react-app-polyfill/ie11'
import * as React from 'react'
import * as ReactDOM from 'react-dom'
import { Web3ReactProvider, useWeb3React } from '@web3-react/core'
import {
  NoEthereumProviderError,
  UnsupportedChainIdError,
  UserRejectedRequestError as UserRejectedRequestErrorInjected
} from '@web3-react/injected-connector'

import {
  URI_AVAILABLE,
  UserRejectedRequestError as UserRejectedRequestErrorWalletConnect
} from '@web3-react/walletconnect-connector'

import { Web3Provider } from '@ethersproject/providers'
import { formatEther } from '@ethersproject/units'

import { injected, walletconnect } from './connectors'
import { useEagerConnect, useInactiveListener } from './hooks'

const connectors = {
  Injected: injected,
  WalletConnect: walletconnect
}

function getErrorMessage(error: Error) {
  if (error instanceof NoEthereumProviderError) {
    return 'No Ethereum browser extension detected, install Metamask on desktop or visit from a dApp browser on mobile.'
  } else if (error instanceof UnsupportedChainIdError) {
    return "You're connected to the wrong network, please switch to Rinkeby, Görli, or Mainnet!"
  } else if (
    error instanceof UserRejectedRequestErrorInjected ||
    error instanceof UserRejectedRequestErrorWalletConnect
  ) {
    return 'Please authorize this website to access your Ethereum account.'
  } else {
    return 'An unknown error occurred. Check the console for more details.'
  }
}

function getLibrary(provider: any) {
  const library = new Web3Provider(provider)
  library.pollingInterval = 5000
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
  const context = useWeb3React()
  const { connector, library, chainId, account, activate, deactivate, active, error } = context

  const [connectorClicked, setConnectorClicked] = React.useState()
  const [activating, setActivating] = React.useState(false)
  React.useEffect(() => {
    if (connector === connectorClicked) {
      setActivating(false)
    }
  }, [connector, connectorClicked])

  const triedEager = useEagerConnect(context, injected)
  useInactiveListener(context, injected, !triedEager || activating)
  ;(window as any).library = library

  // set up block listener
  const [blockNumber, setBlockNumber] = React.useState()
  React.useEffect((): any => {
    if (chainId) {
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
        stale = true
        library.removeListener('block', updateBlockNumber)
        setBlockNumber(undefined)
      }
    }
  }, [chainId, library])

  // fetch eth balance of the connected account
  const [ethBalance, setEthBalance] = React.useState()
  React.useEffect((): any => {
    if (account) {
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
  }, [account, library, chainId])

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
      <h3 style={{ margin: '0' }}>{active ? '🟢' : error ? '🔴' : '🟠'}</h3>

      <h3
        style={{
          display: 'grid',
          gridGap: '.5rem',
          gridTemplateColumns: '8rem 2rem 6rem',
          width: '16rem',
          lineHeight: '2rem'
        }}
      >
        <span>Chain Id</span>
        <span role="img" aria-label="chain">
          ⛓
        </span>
        <span>{chainId === undefined ? '...' : chainId}</span>

        <span>Block Number</span>
        <span role="img" aria-label="numbers">
          🔢
        </span>
        <span>{blockNumber === undefined ? '...' : blockNumber === null ? 'Error' : blockNumber.toLocaleString()}</span>

        <span>Account</span>
        <span role="img" aria-label="robot">
          🤖
        </span>
        <span>{account === undefined ? '...' : account === null ? 'None' : account}</span>

        <span>Balance</span>
        <span role="img" aria-label="gold">
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

      <div>
        {Object.keys(connectors).map(k => (
          <button
            disabled={!triedEager || activating || (connectors as any)[k] === connector || !!error}
            key={k}
            onClick={() => {
              setActivating(true)
              setConnectorClicked((connectors as any)[k])
              activate((connectors as any)[k])
            }}
          >
            Activate {k}
          </button>
        ))}
      </div>

      <br />

      <div>
        <button
          disabled={!active && !!!error}
          onClick={() => {
            deactivate()
          }}
        >
          Deactivate
        </button>
        {connector === walletconnect &&
          !!connector.walletConnector &&
          connector.walletConnector.connected &&
          !activating && (
            <button
              onClick={() => {
                connector.close()
              }}
            >
              Kill WalletConnect Session
            </button>
          )}
      </div>

      {activating && <h3>Connecting...</h3>}
      {!!error && <h3>{getErrorMessage(error)}</h3>}
    </div>
  )
}

ReactDOM.render(<App />, document.getElementById('root'))
