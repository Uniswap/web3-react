import 'react-app-polyfill/ie11'
import * as React from 'react'
import * as ReactDOM from 'react-dom'
import { Web3ReactProvider, useWeb3React } from '@web3-react/core'
import { InjectedConnector } from '@web3-react/injected-connector'
import { Web3Provider } from '@ethersproject/providers'

const injectedConnector = new InjectedConnector({ supportedChainIds: [1, 4] })

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

  return (
    <>
      {!!context.error && <p>Error</p>}

      <p>{context.active ? 'active' : 'inactive'}</p>

      {context.active && (
        <>
          <p>chain id: {context.chainId}</p>
          <p>account: {context.account === null ? 'None' : context.account}</p>
        </>
      )}
      <button
        onClick={
          context.active ? () => (context as any).deactivate() : () => (context as any).activate(injectedConnector)
        }
      >
        {context.active ? 'deactivate' : 'activate'}
      </button>
    </>
  )
}

ReactDOM.render(<App />, document.getElementById('root'))
