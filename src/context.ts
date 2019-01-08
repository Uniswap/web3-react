import { createContext } from 'react'

import { Web3ContextInterface } from './types'

const defaultError = () => console.error('No Web3Provider Found.')
const defaultContext = {
  error               : null,

  networkReRenderer   : NaN,
  forceNetworkReRender: defaultError,
  accountReRenderer   : NaN,
  forceAccountReRender: defaultError,

  active              : false,
  setConnector        : defaultError,
  activateAccount     : defaultError,
  unsetConnector      : defaultError
}

export default createContext<Web3ContextInterface>(defaultContext)
