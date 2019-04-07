import { createContext } from 'react'

import { IWeb3ContextInterface } from './types'

function defaultError() {
  console.error('No <Web3Provider ...> Found.') // tslint:disable-line: no-console
}

async function defaultErrorAsync() {
  console.error('No <Web3Provider ...> Found.') // tslint:disable-line: no-console
}

const defaultContext = {
  active: false,
  error: null,

  setConnector: defaultErrorAsync,
  setFirstValidConnector: defaultErrorAsync,
  unsetConnector: defaultError,
  setError: defaultError // tslint:disable-line: object-literal-sort-keys
}

export default createContext<IWeb3ContextInterface>(defaultContext)
