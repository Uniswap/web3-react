import { createContext } from 'react'

import { IWeb3ContextInterface } from './types'

const defaultError = () => console.error('No Web3Provider Found.') // tslint:disable-line: no-console
const defaultContext = {
  active: false,
  error: null,

  setConnector: defaultError,
  setFirstValidConnector: defaultError,
  unsetConnector: defaultError,

  reRenderers: {},
  forceReRender: defaultError // tslint:disable-line: object-literal-sort-keys
}

export default createContext<IWeb3ContextInterface>(defaultContext)
