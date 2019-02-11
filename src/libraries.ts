import { ethers } from 'ethers'
import Web3 = require('web3')

import { Library, LibraryName } from './types'

// general functions to manage providers/libraries
export function getNewLibraryFromURL(libraryName: LibraryName, providerURL: string): Library {
  // TODO this could/should probably be refactored on a per-libraryName basis
  const provider = new Web3.providers.HttpProvider(providerURL)
  return getNewLibraryFromProvider(libraryName, provider)
}

export function getNewLibraryFromProvider(libraryName: LibraryName, provider: any) {
  switch (libraryName) {
    case 'web3.js':
      return new Web3(provider)
    case 'ethers.js':
      return new ethers.providers.Web3Provider(provider)
  }
}

export function isWeb3(library: Library): library is Web3 {
  return (library as Web3).version === '1.0.0-beta.34'
}

// a few specific functions that cut across libraries
export async function getNetworkId(library: Library): Promise<number> {
  if (isWeb3(library)) {
    return library.eth.net.getId()
  } else {
    return library.getNetwork().then(network => network.chainId)
  }
}

export function getAccounts(library: Library): Promise<string[]> {
  if (isWeb3(library)) {
    return library.eth.getAccounts()
  } else {
    if (!(library instanceof ethers.providers.JsonRpcProvider)) {
      throw Error('This function can only be called with a JsonRpcProvider.')
    }
    return library.listAccounts()
  }
}
