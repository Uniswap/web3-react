import { createContext } from 'react'

import { Web3ContextInterface } from './types'

const defaultError = () => console.error('No Web3Provider Found.')
const defaultContext = {
  networkReRenderer   : NaN,
  forceNetworkReRender: defaultError,
  accountReRenderer   : NaN,
  forceAccountReRender: defaultError,

  activate            : defaultError,
  activateAccount     : defaultError,
  setConnector        : defaultError,
  resetConnectors     : defaultError
}

export default createContext<Web3ContextInterface>(defaultContext)
