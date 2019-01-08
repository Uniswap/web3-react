import Web3 = require('web3')
import { ethers } from 'ethers'

import { Connector } from './connectors'

export type LibraryName = 'web3.js' | 'ethers.js'
export type Library = (
  Web3 | ethers.providers.Provider | ethers.providers.Web3Provider | ethers.providers.JsonRpcProvider
)

export interface ConnectorArguments {
  readonly activateAccountImmediately?: boolean
  readonly supportedNetworks         ?: ReadonlyArray<number>
}

interface ValidWeb3ContextInterface {
  library             : Library
  networkId           : number
  account             : string | null
  error               : Error | null

  networkReRenderer   : number
  forceNetworkReRender: Function
  accountReRenderer   : number
  forceAccountReRender: Function

  active              : boolean
  connectorName       : string
  setConnector        : Function
  activateAccount     : Function
  unsetConnector      : Function
}

interface UndefinedWeb3ContextInterface {
  library             ?: Library
  networkId           ?: number
  account             ?: string | null
  error                : Error | null

  networkReRenderer    : number
  forceNetworkReRender : Function
  accountReRenderer    : number
  forceAccountReRender : Function

  active               : boolean
  connectorName       ?: string
  setConnector         : Function
  activateAccount      : Function
  unsetConnector       : Function
}

export type Web3ContextInterface = ValidWeb3ContextInterface | UndefinedWeb3ContextInterface

export function isValidWeb3ContextInterface(context: Web3ContextInterface): context is ValidWeb3ContextInterface {
  return !!(context.library && context.networkId && context.account !== undefined && context.connectorName)
}

export interface Connectors {
  [propName: string]: Connector
}
