import 'jest-dom/extend-expect'
import React from 'react'
import { fireEvent, render, waitForElement } from 'react-testing-library'

import Web3Provider, { useWeb3Context, Connectors } from '../src'

const { NetworkOnlyConnector } = Connectors

// TODO mock this out so we're not hitting infura every times
const Infura = new NetworkOnlyConnector({
  providerURL: 'https://rinkeby.infura.io/v3/3f0fa5d9c4064d6e8427efac291d66df'
})
const connectors = { Infura }

function MyComponent(): any {
  return (
    <Web3Provider connectors={connectors} libraryName="ethers.js">
      <p data-testid="static-test">test</p>
      <MyChildComponent />
    </Web3Provider>
  )
}

function MyChildComponent(): any {
  const context = useWeb3Context()

  function setInfura(): void {
    context.setConnector('Infura')
  }

  return (
    <>
      <button data-testid="set-connector" onClick={setInfura} />
      {context.networkId ? <p data-testid="dynamic-networkid">{context.networkId}</p> : null}
    </>
  )
}

// TODO remove once https://github.com/kentcdodds/react-testing-library/issues/281 is resolved
const originalError = console.error // eslint-disable-line no-console
beforeAll((): void => {
  // eslint-disable-next-line no-console
  console.error = (...args: any[]): void => {
    if (/Warning.*not wrapped in act/.test(args[0])) {
      return
    }
    originalError.call(console, ...args)
  }
})

afterAll((): void => {
  console.error = originalError // eslint-disable-line no-console
})

test('Rendering', async (): Promise<void> => {
  const { getByTestId, queryByTestId } = render(<MyComponent />)

  expect(getByTestId('static-test')).toHaveTextContent('test')
  expect(queryByTestId('dynamic-networkid')).toBeNull()

  fireEvent.click(getByTestId('set-connector'))
  await waitForElement((): any => getByTestId('dynamic-networkid'))

  expect(getByTestId('static-test')).toHaveTextContent('test')
  expect(getByTestId('dynamic-networkid')).toHaveTextContent('4')
})
