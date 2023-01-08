import { initializeConnector } from '@web3-react/core'
import { Empty, EMPTY } from '@web3-react/empty'
import { StrictMode } from 'react'
import ReactDOM from 'react-dom'

const [, { useAccount }] = initializeConnector<Empty>(() => EMPTY)

function Account() {
  const account = useAccount()
  return <>Account: {account ?? 'None'}</>
}

ReactDOM.render(
  <StrictMode>
    <Account />
  </StrictMode>,
  document.getElementById('root')
)
