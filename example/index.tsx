import 'react-app-polyfill/ie11'

import * as React from 'react'
import * as ReactDOM from 'react-dom'

import { Test } from '../packages/core'

function App() {
  return <Test />
}

ReactDOM.render(<App />, document.getElementById('root'))
