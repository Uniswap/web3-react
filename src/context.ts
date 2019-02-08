import { createContext } from 'react'

import { IWeb3ContextInterface } from './types'

const defaultError = () => console.error('No Web3Provider Found.') // tslint:disable-line: no-console
const defaultContext = {
  accountReRenderer: NaN,
  activateAccount: defaultError,
  active: false,
  error: null,
  forceAccountReRender: defaultError,
  forceNetworkReRender: defaultError,
  networkReRenderer: NaN,
  setConnector: defaultError,
  unsetConnector: defaultError
}

export default createContext<IWeb3ContextInterface>(defaultContext)
