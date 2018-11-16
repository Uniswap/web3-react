import * as ethUtil from 'ethereumjs-util'

export const TRANSACTION_ERRORS = [
  'GAS_PRICE_UNAVAILABLE', 'FAILING_TRANSACTION', 'SENDING_BALANCE_UNAVAILABLE', 'INSUFFICIENT_BALANCE'
]

const ERC20ABI = [{"constant":true,"inputs":[{"name":"_owner","type":"address"}],"name":"balanceOf","outputs":[{"name":"balance","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"decimals","outputs":[{"name":"","type":"uint8"}],"payable":false,"stateMutability":"view","type":"function"}] // eslint-disable-line

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
  },
  6284: {
    name: 'Görli'
  }
}

const ethereumVariables = {
  web3js:    undefined,
  account:   undefined,
  networkId: undefined
}

export function setEthereumVariables (variables) {
  Object.keys(variables).forEach(variable => {
    ethereumVariables[variable] = variables[variable]
  })
}

export function sendTransaction (method, handlers, transactionOptions = {}) {
  // sanitize transactionOptions
  const allowedOptions = ['gasPrice', 'gas', 'value']
  if (!Object.keys(transactionOptions).every(option => allowedOptions.includes(option)))
    throw Error(`Invalid option passed. Allowed options are: '${allowedOptions.toString().join(`', '`)}'.`)

  // sanitize handlers
  const allowedHandlers = ['transactionHash', 'receipt', 'confirmation']
  if (!Object.keys(handlers).every(handler => allowedHandlers.includes(handler)))
    throw Error(`Invalid handler passed. Allowed handlers are: '${allowedHandlers.toString().join(`', '`)}'.`)

  // for all handlers that weren't passed, set them as empty functions
  for (let handler of allowedHandlers) {
    handlers[handler] = handlers[handler] || function () {}
  }

  // unwrap _method if it's a function
  const _method = typeof method === 'function' ? method() : method

  function wrapError(error, name) {
    if (!Object.keys(TRANSACTION_ERRORS).includes(name)) return Error(`Passed error name ${name} is not valid.`)
    error.code = TRANSACTION_ERRORS[name]
    return error
  }

  // define promises for the variables we need to validate/send the transaction
  const gasPricePromise = () => {
    if (transactionOptions.gasPrice) return transactionOptions.gasPrice

    return ethereumVariables.web3js.eth.getGasPrice()
      .catch(error => {
        throw wrapError(error, 'GAS_PRICE_UNAVAILABLE')
      })
  }

  const gasPromise = () => {
    return _method.estimateGas({ from: ethereumVariables.account, gas: transactionOptions.gas })
      .catch(error => {
        throw wrapError(error, 'FAILING_TRANSACTION')
      })
  }

  const balanceWeiPromise = () => {
    return getBalance(undefined, 'wei')
      .catch(error => {
        throw wrapError(error, 'SENDING_BALANCE_UNAVAILABLE')
      })
  }

  return Promise.all([gasPricePromise(), gasPromise(), balanceWeiPromise()])
    .then(([gasPrice, gas, balanceWei]) => {
      // ensure the sender has enough ether to pay gas
      const safeGas = parseInt(gas * 1.1)
      const requiredWei = new ethUtil.BN(gasPrice).mul(new ethUtil.BN(safeGas))
      if (new ethUtil.BN(balanceWei).lt(requiredWei)) {
        const requiredEth = toDecimal(requiredWei.toString(), '18')
        const errorMessage = `Insufficient balance. Ensure you have at least ${requiredEth} ETH.`
        throw wrapError(Error(errorMessage), 'INSUFFICIENT_BALANCE')
      }

      // send the transaction
      return _method.send(
        {from: ethereumVariables.account, gasPrice: gasPrice, gas: safeGas, value: transactionOptions.value}
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

export function signPersonal (message) {
  const from = ethereumVariables.account
  if (!ethUtil.isValidChecksumAddress(from)) throw Error(`Current account '${from}' has an invalid checksum.`)

  // format message properly
  let encodedMessage
  if (Buffer.isBuffer(message)) {
    encodedMessage = ethUtil.addHexPrefix(message.toString('hex'))
  } else if (message.slice(0, 2) === '0x') {
    encodedMessage = message
  } else {
    encodedMessage = ethUtil.bufferToHex(Buffer.from(message, 'utf8'))
  }

  return new Promise((resolve, reject) => {
    ethereumVariables.web3js.currentProvider.sendAsync({
      method: 'personal_sign',
      params: [encodedMessage, from],
      from: from
    }, (error, result) => {
      if (error) return reject(error)
      if (result.error) return reject(result.error.message)

      let returnData = {}
      returnData.signature = result.result

      // ensure that the signature matches
      const signature = ethUtil.fromRpcSig(returnData.signature)
      const messageHash = ethUtil.hashPersonalMessage(ethUtil.toBuffer(encodedMessage))
      const recovered = ethUtil.ecrecover(
        messageHash,
        signature.v, signature.r, signature.s
      )
      const recoveredAddress = ethUtil.toChecksumAddress(ethUtil.pubToAddress(recovered).toString('hex'))
      if (recoveredAddress !== from) {
        return reject(Error(
          `The returned signature '${returnData.signature}' originated from '${recoveredAddress}', not '${from}'.`
        ))
      }

      returnData.r = ethUtil.addHexPrefix(signature.r.toString('hex'))
      returnData.s = ethUtil.addHexPrefix(signature.s.toString('hex'))
      returnData.v = signature.v
      returnData.from = from
      returnData.messageHash = ethUtil.addHexPrefix(messageHash.toString('hex'))

      resolve(returnData)
    })
  })
}

export function getBalance (account = ethereumVariables.account, format = 'ether') {
  return ethereumVariables.web3js.eth.getBalance(account)
    .then(balance => {
      return ethereumVariables.web3js.utils.fromWei(balance, format)
    })
}

export function getERC20Balance (ERC20Address, account = ethereumVariables.account) {
  const ERC20 = getContract(ERC20ABI, ERC20Address)

  const decimalsPromise = () => ERC20.methods.decimals().call()
  const balancePromise = () => ERC20.methods.balanceOf(account).call()

  return Promise.all([balancePromise(), decimalsPromise()])
    .then(([balance, decimals]) => {
      return toDecimal(balance, decimals)
    })
}

export function toDecimal (number, decimals) {
  if (typeof number !== 'string') throw Error(`Passed 'number' argument '${number}' must be a string.`)
  if (typeof decimals !== 'number') throw Error(`Passed 'decimals' argument '${decimals}' must be a number.`)

  if (number.length < decimals) {
    number = '0'.repeat(decimals - number.length) + number
  }
  const difference = number.length - decimals

  const integer = difference === 0 ? '0' : number.slice(0, difference)
  const fraction = number.slice(difference).replace(/0+$/g, '')

  return integer + (fraction === '' ? '' : '.') + fraction
}

export function fromDecimal (number, decimals) {
  if (typeof number !== 'string') throw Error(`Passed 'number' argument '${number}' must be a string.`)
  if (typeof decimals !== 'number') throw Error(`Passed 'decimals' argument '${decimals}' must be a number.`)

  var [integer, fraction] = number.split('.')

  fraction = fraction === undefined ? '' : fraction
  if (fraction.length > decimals) throw Error('The fractional amount of the passed number was too high.')
  fraction = fraction + '0'.repeat(decimals - fraction.length)

  return integer + fraction
}

export function getNetworkName (networkId = ethereumVariables.networkId) {
  if (!Object.keys(networkDataById).includes(String(networkId))) throw Error(`Network id '${networkId}' is invalid.`)
  return networkDataById[networkId].name
}

export function getContract (ABI, address, options) {
  return new ethereumVariables.web3js.eth.Contract(ABI, address, options)
}

export function etherscanFormat (type, data, networkId = ethereumVariables.networkId) {
  if (!['transaction', 'address', 'token'].includes(type)) throw Error(`Type '${type}' is invalid.`)
  if (!Object.keys(networkDataById).includes(networkId)) throw Error(`Network id '${networkId}' is invalid.`)

  const prefix = networkDataById[networkId].etherscanPrefix
  let path
  switch (type) {
    case 'transaction':
      path = 'tx'
      break
    case 'address':
      path = 'address'
      break
    default:
      path = 'token'
      break
  }

  return `https://${prefix}etherscan.io/${path}/${data}`
}
