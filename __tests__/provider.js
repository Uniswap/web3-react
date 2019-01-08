import React from 'react'
import { render, fireEvent, waitForElement } from 'react-testing-library'
import 'jest-dom/extend-expect'

import Web3Provider from '../dist/provider'
import { InfuraConnector } from '../dist/connectors'
import { useWeb3Context } from '../dist/hooks'

const infura = new InfuraConnector({
  providerURL: 'https://rinkeby.infura.io/v3/3f0fa5d9c4064d6e8427efac291d66df'
})
const connectors = { infura }

function MyComponent() {
  return (
    <Web3Provider connectors={connectors} passive={true}>
      <p data-testid="static-test">test</p>
      <MyChildComponent />
    </Web3Provider>
  )
}

function MyChildComponent() {
  const context = useWeb3Context()

  return (
    <>
      <button data-testid='set-connector' onClick={() => context.setConnector('infura')}></button>
      {context.networkId ? <p data-testid="dynamic-networkid">{context.networkId}</p> : null}
    </>
  )
}

test('Rendering', async () => {
  const { getByTestId, queryByTestId } = render(<MyComponent />)

  expect(getByTestId('static-test')).toHaveTextContent('test')
  expect(queryByTestId('dynamic-networkid')).toBeNull()

  fireEvent.click(getByTestId('set-connector'))
  await waitForElement(() => getByTestId('dynamic-networkid'))

  expect(getByTestId('static-test')).toHaveTextContent('test')
  expect(getByTestId('dynamic-networkid')).toHaveTextContent('4')
})
