import 'react-app-polyfill/ie11'
import * as React from 'react'
import * as ReactDOM from 'react-dom'
import { Web3ReactProvider, useWeb3React } from '@web3-react/core'
import {
  NoEthereumProviderError,
  UnsupportedChainIdError,
  UserRejectedRequestError
} from '@web3-react/injected-connector'
import { Web3Provider } from '@ethersproject/providers'
import { formatEther } from '@ethersproject/units'

import { injected } from './connectors'
import { useEagerConnect, useInactiveListener } from './hooks'

function getErrorMessage(error: Error) {
  if (error instanceof NoEthereumProviderError) {
    return 'No Ethereum browser extension detected, install Metamask on desktop or visit from a dApp browser on mobile.'
  } else if (error instanceof UnsupportedChainIdError) {
    return "You're connected to the wrong network, please switch to Rinkeby, Görli, or Mainnet!"
  } else if (error instanceof UserRejectedRequestError) {
    return 'Please authorize this website in your Ethereum browser extension.'
  } else {
    console.error(error)
    return 'An unknown error occurred. Check the console for more details.'
  }
}

function getLibrary(provider: any) {
  return new Web3Provider(provider)
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
  const { library, chainId, account, activate, deactivate, active, error } = context

  const [clickedActivate, setClickedActivate] = React.useState(false)
  const [ethBalance, setEthBalance] = React.useState()

  const activating = clickedActivate && !active && !!!error

  const triedEager = useEagerConnect(context, injected)
  useInactiveListener(context, injected, !triedEager || activating)

  React.useEffect(() => {
    if (!active && !error) {
      setClickedActivate(false)
    }
  }, [active, error])

  React.useEffect((): any => {
    if (account) {
      library
        .getBalance(account)
        .then(setEthBalance)
        .catch(() => {
          setEthBalance(null)
        })

      return () => {
        setEthBalance(undefined)
      }
    }
  }, [chainId, account])

  return (
    <>
      <h3>{active ? '🟢' : error ? '🔴' : '🟠'}</h3>
      <h3>Chain Id ⛓: {chainId === undefined ? '...' : chainId}</h3>
      <h3>Account 🤖: {account === undefined ? '...' : account === null ? 'None' : account}</h3>
      <h3>
        Balance 💰:{' '}
        {ethBalance === undefined
          ? '...'
          : ethBalance === null
          ? 'Error'
          : `${parseFloat(formatEther(ethBalance)).toPrecision(4)} ETH`}
      </h3>

      <button
        disabled={!triedEager || !!error}
        onClick={
          !active
            ? () => {
                setClickedActivate(true)
                activate(injected)
              }
            : () => {
                deactivate()
              }
        }
      >
        {!active ? 'activate' : 'deactivate'}
      </button>

      {activating && <h3>Connecting...</h3>}
      {!!error && <h3>{getErrorMessage(error)}</h3>}
    </>
  )
}

ReactDOM.render(<App />, document.getElementById('root'))
