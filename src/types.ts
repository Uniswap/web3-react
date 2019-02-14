import { ethers } from 'ethers'
import Web3 = require('web3')

export type LibraryName = 'web3.js' | 'ethers.js'
export type Library = Web3 | ethers.providers.Web3Provider

export interface IReRendererState {
  [propName: string]: number
}

interface IValidWeb3ContextInterface {
  active: boolean
  connectorName: string
  connector: any
  library: Library
  networkId: number
  account: string | null
  error: Error | null

  setConnector: Function // tslint:disable-line: ban-types
  setFirstValidConnector: Function // tslint:disable-line: ban-types
  unsetConnector: Function // tslint:disable-line: ban-types
  setError: Function // tslint:disable-line: ban-types

  reRenderers: IReRendererState
  forceReRender: Function // tslint:disable-line: ban-types
}

interface IUndefinedWeb3ContextInterface {
  active: boolean
  connectorName?: string
  connector?: any
  library?: Library
  networkId?: number
  account?: string | null
  error: Error | null

  setConnector: Function // tslint:disable-line: ban-types
  setFirstValidConnector: Function // tslint:disable-line: ban-types
  unsetConnector: Function // tslint:disable-line: ban-types
  setError: Function // tslint:disable-line: ban-types

  reRenderers: IReRendererState
  forceReRender: Function // tslint:disable-line: ban-types
}

export type IWeb3ContextInterface = IValidWeb3ContextInterface | IUndefinedWeb3ContextInterface

export function isValidWeb3ContextInterface(context: IWeb3ContextInterface): context is IValidWeb3ContextInterface {
  return !!(
    context.connectorName &&
    context.connector &&
    context.library &&
    context.networkId &&
    context.account !== undefined
  )
}

export interface IConnectors {
  [propName: string]: any
}
