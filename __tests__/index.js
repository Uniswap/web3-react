import test from 'ava'
import React from 'react'
import renderer from 'react-test-renderer'
import Web3Provider from '../src/index'

function MyComponent() {
  return (
    <Web3Provider></Web3Provider>
  )
}

test('renders without crashing', t => {
  const testRenderer = renderer.create(<MyComponent />)
  t.is(testRenderer.toJSON().type, 'div')
})
