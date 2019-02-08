import { ethers } from 'ethers'
import Web3 = require('web3')

export type LibraryName = 'web3.js' | 'ethers.js'
export type Library =
  | Web3
  | ethers.providers.Provider
  | ethers.providers.Web3Provider
  | ethers.providers.JsonRpcProvider

export interface IConnectorArguments {
  readonly activateAccountImmediately?: boolean
  readonly supportedNetworks?: ReadonlyArray<number>
}

interface IValidWeb3ContextInterface {
  library: Library
  networkId: number
  account: string | null
  error: Error | null

  networkReRenderer: number
  forceNetworkReRender: Function // tslint:disable-line: ban-types
  accountReRenderer: number
  forceAccountReRender: Function // tslint:disable-line: ban-types

  active: boolean
  connectorName: string
  setConnector: Function // tslint:disable-line: ban-types
  activateAccount: Function // tslint:disable-line: ban-types
  unsetConnector: Function // tslint:disable-line: ban-types
}

interface IUndefinedWeb3ContextInterface {
  library?: Library
  networkId?: number
  account?: string | null
  error: Error | null

  networkReRenderer: number
  forceNetworkReRender: Function // tslint:disable-line: ban-types
  accountReRenderer: number
  forceAccountReRender: Function // tslint:disable-line: ban-types

  active: boolean
  connectorName?: string
  setConnector: Function // tslint:disable-line: ban-types
  activateAccount: Function // tslint:disable-line: ban-types
  unsetConnector: Function // tslint:disable-line: ban-types
}

export type IWeb3ContextInterface = IValidWeb3ContextInterface | IUndefinedWeb3ContextInterface

export function isValidWeb3ContextInterface(context: IWeb3ContextInterface): context is IValidWeb3ContextInterface {
  return !!(context.library && context.networkId && context.account !== undefined && context.connectorName)
}

export interface IConnectors {
  [propName: string]: any
}
