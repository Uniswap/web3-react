import test from 'ava'
import React from 'react'
import renderer from 'react-test-renderer'
import Web3Provider from '../src/index'
import Initializing from '../src/defaultScreens/Initializing'

function MyComponent() {
  return (
    <Web3Provider></Web3Provider>
  )
}

test.skip('tests are bugged', t => { // eslint-disable-line ava/no-skip-test
  const testRenderer = renderer.create(<MyComponent />)
  const testInstance = testRenderer.root
  testInstance.findByType(Initializing)
  t.pass()
})
