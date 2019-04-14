import { createContext } from 'react'

import { ManagerFunctions } from './manager'

export type Library = any

export interface Web3Context extends ManagerFunctions {
  active: boolean
  connectorName?: string
  connector?: any
  library?: Library
  networkId?: number
  account?: string | null
  error: Error | null
}

function defaultError(): void {
  console.error('No <Web3Provider ...> Found.') // eslint-disable-line no-console
}

async function defaultErrorAsync(): Promise<void> {
  console.error('No <Web3Provider ...> Found.') // eslint-disable-line no-console
}

const defaultContext = {
  active: false,
  error: null,

  setConnector: defaultErrorAsync,
  setFirstValidConnector: defaultErrorAsync,
  unsetConnector: defaultError,
  setError: defaultError
}

export default createContext<Web3Context>(defaultContext)
