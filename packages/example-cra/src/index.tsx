import { initializeConnector } from '@web3-react/core'
import { Empty, EMPTY } from '@web3-react/empty'
import React from 'react'
import ReactDOM from 'react-dom'

const [, { useAccount }] = initializeConnector<Empty>(() => EMPTY)

function Account() {
  const account = useAccount()
  return <>Account: {account ?? 'None'}</>
}

ReactDOM.render(
  <React.StrictMode>
    <Account />
  </React.StrictMode>,
  document.getElementById('root')
)
