import Web3 = require('web3')
import { ethers } from 'ethers'

import { Connector } from './connectors'

export type LibraryName = "web3.js" | "ethers.js"
export type Library =
  Web3 | ethers.providers.Provider | ethers.providers.Web3Provider | ethers.providers.JsonRpcProvider

export interface Web3ContextInterface {
  library             ?: Library
  networkId           ?: number
  account             ?: string | null

  accountReRenderer   ?: number
  forceAccountReRender?: () => void
  networkReRenderer   ?: number
  forceNetworkReRender?: () => void

  connectorName       ?: string
  activate            ?: () => void
  activateAccount     ?: () => void
  setConnector        ?: () => void
  unsetConnector      ?: () => void
}

export interface Connectors {
  [propName: string]: Connector
}
