import { toBuffer, bufferToHex, addHexPrefix, fromRpcSig, hashPersonalMessage } from 'ethereumjs-util'

import Web3 = require('web3')
import { ethers } from 'ethers'

import {
  getAccountBalance as getAccountBalanceLibrary,
  getERC20Balance as getERC20BalanceLibrary,
  sendAsync,
  isWeb3
} from './libraries'

import { Library } from './types'

interface NetworkId {
  name: string
  etherscanPrefix: string
}

const networkDataById: { [propName: string]: NetworkId } = {
  1: {
    name: 'Mainnet',
    etherscanPrefix: ''
  },
  3: {
    name: 'Ropsten',
    etherscanPrefix: 'ropsten.'
  },
  4: {
    name: 'Rinkeby',
    etherscanPrefix: 'rinkeby.'
  },
  42: {
    name: 'Kovan',
    etherscanPrefix: 'kovan.'
  }
}

const etherscanTypes: any = {'transaction': 'tx', 'address': 'address', 'token': 'token'}

export const TRANSACTION_ERROR_CODES: Array<string> = [
  'GAS_PRICE_UNAVAILABLE', 'FAILING_TRANSACTION', 'SENDING_BALANCE_UNAVAILABLE', 'INSUFFICIENT_BALANCE'
]

export function getNetworkName (networkId: number): string {
  if (!Object.keys(networkDataById).includes(String(networkId))) throw Error(`networkID '${networkId}' is invalid.`)
  return networkDataById[networkId].name
}

export function getEtherscanLink(networkId: number, type: string, data: string): string {
  if (!Object.keys(etherscanTypes).includes(type)) throw Error(`type '${type}' is invalid.`)
  if (!Object.keys(networkDataById).includes(String(networkId))) throw Error(`networkID '${networkId}' is invalid.`)

  const path = etherscanTypes[type]
  const prefix = networkDataById[networkId].etherscanPrefix

  return `https://${prefix}etherscan.io/${path}/${data}`
}

export function getAccountBalance (library: Library, address: string, format = 'ether'): Promise<string> {
  return getAccountBalanceLibrary(library, address, format)
}

export function getERC20Balance (library: Library, ERC20Address: string, address: string): Promise<string> {
  return getERC20BalanceLibrary(library, ERC20Address, address)
}

export async function signPersonal (library: Library, address: string, message: string): Promise<any> {
  address = ethers.utils.getAddress(address)

  // format message properly
  let encodedMessage: string
  if (Buffer.isBuffer(message)) {
    encodedMessage = addHexPrefix(message.toString('hex'))
  } else if (message.slice(0, 2) === '0x') {
    encodedMessage = message
  } else {
    encodedMessage = bufferToHex(Buffer.from(message, 'utf8'))
  }

  return sendAsync(library, 'personal_sign', [encodedMessage, address], address)
    .then((result: any) => {
      const returnData: any = {}
      returnData.signature = result.result

      // ensure that the signature matches
      const signature = fromRpcSig(returnData.signature)
      const messageHash: any = hashPersonalMessage(toBuffer(encodedMessage))

      returnData.r = addHexPrefix(signature.r.toString('hex'))
      returnData.s = addHexPrefix(signature.s.toString('hex'))
      returnData.v = signature.v
      returnData.from = address
      returnData.messageHash = addHexPrefix(messageHash.toString('hex'))

      return returnData
    })
}

export async function sendTransaction(
  library: Library, address: string, method: string | Function, handlers: any = {}, transactionOptions: any = {}
): Promise<void> {
  if (!isWeb3(library)) throw Error('Not Implemented: sendTransaction currently only works for web3.js')

  // sanitize transactionOptions
  const allowedOptions = ['gasPrice', 'gas', 'value']
  if (!Object.keys(transactionOptions).every(option => allowedOptions.includes(option)))
    throw Error(`Invalid option passed. Allowed options are: '${allowedOptions.join(`', '`)}'.`)

  // sanitize handlers
  const allowedHandlers = ['transactionHash', 'receipt', 'confirmation']
  if (!Object.keys(handlers).every(handler => allowedHandlers.includes(handler)))
    throw Error(`Invalid handler passed. Allowed handlers are: '${allowedHandlers.join(`', '`)}'.`)
  for (let handler of allowedHandlers)
    handlers[handler] = handlers[handler] || function () {}

  // lets us throw specific errors
  function wrapError(error: Error, name: string) {
    if (!TRANSACTION_ERROR_CODES.includes(name)) return Error(`Passed error name ${name} is not valid.`)
    error.code = name
    return error
  }

  // unwrap method if it's a function
  const _method = typeof method === 'function' ? method() : method

  // define promises for the variables we need to validate/send the transaction
  async function gasPricePromise (): Promise<number> {
    if (transactionOptions.gasPrice) return transactionOptions.gasPrice

    return (library as Web3).eth.getGasPrice()
      .catch((error: Error) => {
        throw wrapError(error, 'GAS_PRICE_UNAVAILABLE')
      })
  }

  async function gasPromise (): Promise<string> {
    return _method.estimateGas({ from: address, gas: transactionOptions.gas })
      .catch((error: Error) => {
        throw wrapError(error, 'FAILING_TRANSACTION')
      })
  }

  async function balanceWeiPromise (): Promise<string> {
    return getAccountBalance(library, address, 'wei')
      .catch(error => {
        throw wrapError(error, 'SENDING_BALANCE_UNAVAILABLE')
      })
  }

  return Promise.all([gasPricePromise(), gasPromise(), balanceWeiPromise()])
    .then(([gasPrice, gas, balanceWei]: [number, string, string]) => {
      // ensure the sender has enough ether to pay gas
      const safeGas: number = parseInt(`${Number(gas) * 1.1}`)
      const requiredWei = ethers.utils.bigNumberify(gasPrice).mul(ethers.utils.bigNumberify(safeGas))
      if (ethers.utils.bigNumberify(balanceWei).lt(requiredWei)) {
        const requiredEth = toDecimal(requiredWei.toString(), 18)
        const errorMessage = `Insufficient balance. Ensure you have at least ${requiredEth} ETH.`
        throw wrapError(Error(errorMessage), 'INSUFFICIENT_BALANCE')
      }

      // send the transaction
      return _method.send(
        {from: address, gasPrice: gasPrice, gas: safeGas, value: transactionOptions.value}
      )
        .on('transactionHash', (transactionHash: string) => {
          handlers['transactionHash'](transactionHash)
        })
        .on('receipt', (receipt: any) => {
          handlers['receipt'](receipt)
        })
        .on('confirmation', (confirmationNumber: number, receipt: any) => {
          handlers['confirmation'](confirmationNumber, receipt)
        })
    })
}

export function toDecimal (number: string, decimals: number): string {
  if (number.length < decimals) {
    number = '0'.repeat(decimals - number.length) + number
  }
  const difference = number.length - decimals

  const integer = difference === 0 ? '0' : number.slice(0, difference)
  const fraction = number.slice(difference).replace(/0+$/g, '')

  return integer + (fraction === '' ? '' : '.') + fraction
}

export function fromDecimal (number: string, decimals: number): string {
  var [integer, fraction] = number.split('.')

  fraction = fraction === undefined ? '' : fraction
  if (fraction.length > decimals) throw Error('The fractional amount of the passed number was too high.')
  fraction = fraction + '0'.repeat(decimals - fraction.length)

  return integer + fraction
}
