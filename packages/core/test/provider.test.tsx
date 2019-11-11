import * as React from 'react'
import * as ReactDOM from 'react-dom'

import { Web3ReactProvider } from '../src'

function App() {
  return (
    <Web3ReactProvider getLibrary={() => {}}>
      <div>test!</div>
    </Web3ReactProvider>
  )
}

describe('it', () => {
  it('renders without crashing', () => {
    const div = document.createElement('div')
    ReactDOM.render(<App />, div)
    ReactDOM.unmountComponentAtNode(div)
  })
})
