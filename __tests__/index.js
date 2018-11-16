import test from 'ava'
import React from 'react'
import renderer from 'react-test-renderer'
import Web3Provider from '../src/index'
import { Initializing } from '../src/defaultScreens'

function MyComponent() {
  return (
    <Web3Provider></Web3Provider>
  )
}

test('renders Initializing', t => {
  const testRenderer = renderer.create(<MyComponent />)
  const testInstance = testRenderer.root
  testInstance.findByType(Initializing)
  t.pass()
})
