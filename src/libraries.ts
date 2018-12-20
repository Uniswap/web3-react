import Web3 = require('web3')
import { ethers } from 'ethers'

import { toDecimal } from './utilities'
import { Library, LibraryName } from './web3-react'

const ERC20_ABI = [{"constant":true,"inputs":[{"name":"_owner","type":"address"}],"name":"balanceOf","outputs":[{"name":"balance","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"decimals","outputs":[{"name":"","type":"uint8"}],"payable":false,"stateMutability":"view","type":"function"}] // eslint-disable-line

export function getNewProvider (libraryName: LibraryName, method: 'http' | 'injected', args: any) {
  switch (method) {
    case 'http':
      return getNewHttpProvider(libraryName, args)
    case 'injected':
      return getNewInjectedProvider(libraryName, args)
  }
}

function getNewHttpProvider(libraryName: LibraryName, providerURL: string) {
  switch (libraryName) {
    case 'web3.js':
      return new Web3(new Web3.providers.HttpProvider(providerURL))
    case 'ethers.js':
      return new ethers.providers.JsonRpcProvider(providerURL)
    default:
      throw Error(`Unrecognized libraryName ${libraryName}.`)
  }
}

function getNewInjectedProvider(libraryName: LibraryName, provider: any) {
  switch (libraryName) {
    case 'web3.js':
      return new Web3(provider)
    case 'ethers.js':
      return new ethers.providers.Web3Provider(provider)
  }
}

export async function getNetworkId (library: Library): Promise<number> {
  if (isWeb3(library))
    return (library as Web3).eth.net.getId()
  else
    return (library as ethers.providers.Provider).getNetwork().then(network => network.chainId)
}

export function getAccounts (library: Library): Promise<string[]> {
  if (isWeb3(library))
    return (library as Web3).eth.getAccounts()
  else
    return (library as ethers.providers.JsonRpcProvider).listAccounts()
}

export async function getAccountBalance (library: Library, address: string, format: any): Promise<string> {
  if (isWeb3(library))
    return (library as Web3).eth.getBalance(address)
      .then(balance => (library as Web3).utils.fromWei(balance, format).toString(10))
  else
    return (library as ethers.providers.Provider).getBalance(address)
      .then(balance => ethers.utils.formatUnits(balance, format))
}

export async function getERC20Balance (library: Library, ERC20Address: string, address: string): Promise<string> {
  if (isWeb3(library)) {
    const ERC20 = new (library as Web3).eth.Contract(ERC20_ABI, ERC20Address)

    const decimalsPromise = () => ERC20.methods.decimals().call()
    const balancePromise = () => ERC20.methods.balanceOf(address).call()

    return Promise.all([decimalsPromise(), balancePromise()])
      .then(([decimals, balance]) => toDecimal(balance, decimals))
  } else {
    const ERC20 = new ethers.Contract(ERC20Address, ERC20_ABI, library as ethers.providers.Provider);

    const decimalsPromise = () => ERC20.decimals()
    const balancePromise = () => ERC20.balanceOf(address)

    return Promise.all([decimalsPromise(), balancePromise()])
      .then(([decimals, balance]) => toDecimal(balance, decimals))
  }
}

function getProvider (library: Library): any {
  if (isWeb3(library))
    return library.currentProvider
  else
    return (library as ethers.providers.Web3Provider)._web3Provider
}

export function sendAsync (library: Library, method: string, params: Array<any>, from: string) {
  return new Promise((resolve, reject) => {
    getProvider(library).sendAsync({ method, params, from }, (error: Error, result: any) => {
      if (error) return reject(error)
      if (result.error) return reject(result.error.message)
      return resolve(result)
    })
  })
}

export function isWeb3(library: Library): library is Web3 {
  return (library as Web3).version === '1.0.0-beta.34'
}
