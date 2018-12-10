import {
  isValidChecksumAddress, toChecksumAddress,
  toBuffer, bufferToHex, addHexPrefix, BN,
  fromRpcSig, hashPersonalMessage, ecrecover, pubToAddress
} from 'ethereumjs-util'

const networkDataById = {
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

const etherscanTypes = {'transaction': 'tx', 'address': 'address', 'token': 'token'}

const ERC20_ABI = [{"constant":true,"inputs":[{"name":"_owner","type":"address"}],"name":"balanceOf","outputs":[{"name":"balance","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"decimals","outputs":[{"name":"","type":"uint8"}],"payable":false,"stateMutability":"view","type":"function"}] // eslint-disable-line

export const TRANSACTION_ERROR_CODES = [
  'GAS_PRICE_UNAVAILABLE', 'FAILING_TRANSACTION', 'SENDING_BALANCE_UNAVAILABLE', 'INSUFFICIENT_BALANCE'
]

export function getNetworkName (networkId) {
  if (!Object.keys(networkDataById).includes(String(networkId))) throw Error(`networkID '${networkId}' is invalid.`)
  return networkDataById[networkId].name
}

export function getEtherscanLink(networkId, type, data) {
  if (!Object.keys(etherscanTypes).includes(type)) throw Error(`type '${type}' is invalid.`)
  if (!Object.keys(networkDataById).includes(String(networkId))) throw Error(`networkID '${networkId}' is invalid.`)

  const path = etherscanTypes[type]
  const prefix = networkDataById[networkId].etherscanPrefix

  return `https://${prefix}etherscan.io/${path}/${data}`
}

export function getAccountBalance (web3js, address, format = 'ether') {
  return web3js.eth.getBalance(address)
    .then(balance => web3js.utils.fromWei(balance, format))
}

export function getERC20Balance (web3js, ERC20Address, address) {
  const ERC20 = new web3js.eth.Contract(ERC20_ABI, ERC20Address)

  const decimalsPromise = () => ERC20.methods.decimals().call()
  const balancePromise = () => ERC20.methods.balanceOf(address).call()

  return Promise.all([decimalsPromise(), balancePromise()])
    .then(([decimals, balance]) => toDecimal(balance, decimals))
}

export function signPersonal (web3js, address, message) {
  if (!isValidChecksumAddress(address)) throw Error(`Passed address '${address}' has an invalid checksum.`)

  // format message properly
  let encodedMessage
  if (Buffer.isBuffer(message)) {
    encodedMessage = addHexPrefix(message.toString('hex'))
  } else if (message.slice(0, 2) === '0x') {
    encodedMessage = message
  } else {
    encodedMessage = bufferToHex(Buffer.from(message, 'utf8'))
  }

  return new Promise((resolve, reject) => {
    web3js.currentProvider.sendAsync({
      method: 'personal_sign',
      params: [encodedMessage, address],
      from: address
    }, (error, result) => {
      if (error) return reject(error)
      if (result.error) return reject(result.error.message)

      let returnData = {}
      returnData.signature = result.result

      // ensure that the signature matches
      const signature = fromRpcSig(returnData.signature)
      const messageHash = hashPersonalMessage(toBuffer(encodedMessage))
      const recovered = ecrecover(
        messageHash,
        signature.v, signature.r, signature.s
      )
      const recoveredAddress = toChecksumAddress(pubToAddress(recovered).toString('hex'))
      if (recoveredAddress !== address) {
        return reject(Error(
          `The returned signature '${returnData.signature}' originated from '${recoveredAddress}', not '${address}'.`
        ))
      }

      returnData.r = addHexPrefix(signature.r.toString('hex'))
      returnData.s = addHexPrefix(signature.s.toString('hex'))
      returnData.v = signature.v
      returnData.from = address
      returnData.messageHash = addHexPrefix(messageHash.toString('hex'))

      resolve(returnData)
    })
  })
}

export function sendTransaction(web3js, address, method, handlers = {}, transactionOptions = {}) {
  // sanitize transactionOptions
  const allowedOptions = ['gasPrice', 'gas', 'value']
  if (!Object.keys(transactionOptions).every(option => allowedOptions.includes(option)))
    throw Error(`Invalid option passed. Allowed options are: '${allowedOptions.toString().join(`', '`)}'.`)

  // sanitize handlers
  const allowedHandlers = ['transactionHash', 'receipt', 'confirmation']
  if (!Object.keys(handlers).every(handler => allowedHandlers.includes(handler)))
    throw Error(`Invalid handler passed. Allowed handlers are: '${allowedHandlers.toString().join(`', '`)}'.`)
  for (let handler of allowedHandlers)
    handlers[handler] = handlers[handler] || function () {}

  // lets us throw specific errors
  function wrapError(error, name) {
    if (!TRANSACTION_ERROR_CODES.includes(name)) return Error(`Passed error name ${name} is not valid.`)
    error.code = name
    return error
  }

  // unwrap method if it's a function
  const _method = typeof method === 'function' ? method() : method

  // define promises for the variables we need to validate/send the transaction
  const gasPricePromise = () => {
    if (transactionOptions.gasPrice) return transactionOptions.gasPrice

    return web3js.eth.getGasPrice()
      .catch(error => {
        throw wrapError(error, 'GAS_PRICE_UNAVAILABLE')
      })
  }

  const gasPromise = () => {
    return _method.estimateGas({ from: address, gas: transactionOptions.gas })
      .catch(error => {
        throw wrapError(error, 'FAILING_TRANSACTION')
      })
  }

  const balanceWeiPromise = () => {
    return getAccountBalance(web3js, address, 'wei')
      .catch(error => {
        throw wrapError(error, 'SENDING_BALANCE_UNAVAILABLE')
      })
  }

  return Promise.all([gasPricePromise(), gasPromise(), balanceWeiPromise()])
    .then(([gasPrice, gas, balanceWei]) => {
      // ensure the sender has enough ether to pay gas
      const safeGas = parseInt(gas * 1.1)
      const requiredWei = new BN(gasPrice).mul(new BN(safeGas))
      if (new BN(balanceWei).lt(requiredWei)) {
        const requiredEth = toDecimal(requiredWei.toString(), '18')
        const errorMessage = `Insufficient balance. Ensure you have at least ${requiredEth} ETH.`
        throw wrapError(Error(errorMessage), 'INSUFFICIENT_BALANCE')
      }

      // send the transaction
      return _method.send(
        {from: address, gasPrice: gasPrice, gas: safeGas, value: transactionOptions.value}
      )
        .on('transactionHash', transactionHash => {
          handlers['transactionHash'](transactionHash)
        })
        .on('receipt', receipt => {
          handlers['receipt'](receipt)
        })
        .on('confirmation', (confirmationNumber, receipt) => {
          handlers['confirmation'](confirmationNumber, receipt)
        })
    })
}

export function toDecimal (number, decimals) {
  number = String(number)
  decimals = Number(decimals)

  if (number.length < decimals) {
    number = '0'.repeat(decimals - number.length) + number
  }
  const difference = number.length - decimals

  const integer = difference === 0 ? '0' : number.slice(0, difference)
  const fraction = number.slice(difference).replace(/0+$/g, '')

  return integer + (fraction === '' ? '' : '.') + fraction
}

export function fromDecimal (number, decimals) {
  number = String(number)
  decimals = Number(decimals)

  var [integer, fraction] = number.split('.')

  fraction = fraction === undefined ? '' : fraction
  if (fraction.length > decimals) throw Error('The fractional amount of the passed number was too high.')
  fraction = fraction + '0'.repeat(decimals - fraction.length)

  return integer + fraction
}
