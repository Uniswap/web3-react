import Web3 = require('web3')
import { ethers } from 'ethers'

import { Connector } from './connectors'

export type LibraryName = "web3.js" | "ethers.js"
export type Library =
  Web3 | ethers.providers.Provider | ethers.providers.Web3Provider | ethers.providers.JsonRpcProvider

interface ValidWeb3ContextInterface {
  library             : Library
  networkId           : number
  account             : string | null

  networkReRenderer   : number
  forceNetworkReRender: Function
  accountReRenderer   : number
  forceAccountReRender: Function

  connectorName       : string
  activate            : Function
  activateAccount     : Function
  setConnector        : Function
  resetConnectors     : Function
}

interface UndefinedWeb3ContextInterface {
  library             ?: Library
  networkId           ?: number
  account             ?: string | null

  accountReRenderer    : number
  forceAccountReRender : Function
  networkReRenderer    : number
  forceNetworkReRender : Function

  connectorName       ?: string
  activate             : Function
  activateAccount      : Function
  setConnector         : Function
  resetConnectors      : Function
}

export type Web3ContextInterface = ValidWeb3ContextInterface | UndefinedWeb3ContextInterface

export function isValidWeb3ContextInterface(context: Web3ContextInterface): context is ValidWeb3ContextInterface {
  return !!(context.library && context.networkId && context.account !== undefined && context.connectorName)
}

export interface Connectors {
  [propName: string]: Connector
}
