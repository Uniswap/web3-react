import { useState, useEffect, useContext, useReducer, useMemo } from 'react'

import Web3Context from './context'
import {
  getNetworkName, getEtherscanLink, getAccountBalance, getERC20Balance,
  signPersonal, sendTransaction, TRANSACTION_ERROR_CODES
} from './utilities'

export function useWeb3Context () {
  return useContext(Web3Context)
}

export function useNetworkName (networkId) {
  const context = useWeb3Context()
  return useMemo(() => getNetworkName(networkId || context.networkId), [networkId, context.networkId])
}

export function useEtherscanLink (type, data, networkId) {
  const context = useWeb3Context()
  return useMemo(
    () => getEtherscanLink(networkId || context.networkId, type, data), [networkId, context.networkId, type, data]
  )
}

export function useAccountEffect(effect, depends = []) {
  const context = useWeb3Context()
  useEffect(effect, [...depends, context.networkId, context.account, context.reRenderers.accountReRenderer])
}

export function useNetworkEffect(effect, depends = []) {
  const context = useWeb3Context()
  useEffect(effect, [...depends, context.networkId, context.reRenderers.networkReRenderer])
}

export function useAccountAndNetworkEffect(effect, depends = []) {
  const context = useWeb3Context()
  useAccountEffect(effect, depends.concat([context.reRenderers.networkReRenderer]))
}

export function useAccountBalance (address, {numberOfDigits = 3, format} = {}) {
  const context = useWeb3Context()
  const [ balance, setBalance ] = useState(undefined)

  useAccountEffect(() => {
    if (context.account) {
      getAccountBalance(context.library, address || context.account, format)
        .then(balance =>
          setBalance(Number(balance).toLocaleString(undefined, { maximumFractionDigits: numberOfDigits }))
        )
    }
  })

  return balance
}

export function useERC20Balance (ERC20Address, address, numberOfDigits = 3) {
  const context = useWeb3Context()
  const [ ERC20Balance, setERC20Balance ] = useState(undefined)

  useAccountEffect(() => {
    if (address || context.account) {
      getERC20Balance(context.library, ERC20Address, address || context.account)
        .then(balance =>
          setERC20Balance(Number(balance).toLocaleString(undefined, { maximumFractionDigits: numberOfDigits }))
        )
    }
  })

  return ERC20Balance
}

const initialSignature = {
  state: 'ready',
  data: {
    signature:          undefined,
    signatureError:     undefined
  }
}

function signatureReducer (state, action) {
  switch (action.type) {
    case 'READY':
      return initialSignature
    case 'PENDING':
      return { state: 'pending', data: initialSignature.data }
    case 'SUCCESS':
      return { state: 'success', data: { ...state.data, ...action.data } }
    case 'ERROR':
      return { state: 'error',   data: { ...state.data, ...action.data } }
    default:
      throw Error('No default case.')
  }
}

export function useSignPersonalManager (message, { handlers = {} } = {}) {
  const context = useWeb3Context()

  const [signature, dispatch] = useReducer(signatureReducer, initialSignature)

  function _signPersonal () {
    dispatch({ type: 'PENDING' })
    signPersonal(context.library, context.account, message)
      .then(signature => {
        dispatch({ type: 'SUCCESS', data: { signature: signature } })
        handlers.success && handlers.success(signature)
      })
      .catch(error => {
        dispatch({ type: 'ERROR', data: { signatureError: error } })
        handlers.error && handlers.error(error)
      })
  }

  function resetSignature () { dispatch({ type: 'READY' }) }

  if (!context.account)
    throw Error('useSignPersonalManager was called without an account in context. Please use an appropriate connector.')

  return [signature.state, signature.data, _signPersonal, resetSignature]
}

const initialTransaction = {
  state: 'ready',
  data: {
    transactionHash:          undefined,
    transactionReceipt:       undefined,
    transactionConfirmations: undefined,
    transactionError:         undefined,
    transactionErrorCode:     undefined
  }
}

function transactionReducer (state, action) {
  switch (action.type) {
    case 'READY':
      return initialTransaction
    case 'SENDING':
      return { state: 'sending', data: initialTransaction.data }
    case 'PENDING':
      return { state: 'pending', data: { ...state.data, ...action.data } }
    case 'SUCCESS':
      return { state: 'success', data: { ...state.data, ...action.data } }
    case 'ERROR':
      return { state: 'error',   data: { ...state.data, ...action.data } }
    default:
      throw Error('No default case.')
  }
}

export function useTransactionManager (
  method, { handlers = {}, transactionOptions = {}, maximumConfirmations = null } = {}
) {
  const context = useWeb3Context()

  const [transaction, dispatch] = useReducer(transactionReducer, initialTransaction)

  const wrappedHandlers = {
    transactionHash: transactionHash => {
      dispatch({ type: 'PENDING', data: { transactionHash: transactionHash } })
      handlers.transactionHash && handlers.transactionHash(transactionHash)
    },
    receipt: transactionReceipt => {
      dispatch({ type: 'SUCCESS', data: { transactionReceipt: transactionReceipt } })
      handlers.receipt && handlers.receipt(transactionReceipt)
    },
    confirmation: (transactionConfirmations, transactionReceipt) => {
      if (maximumConfirmations && transactionConfirmations <= maximumConfirmations) {
        dispatch({
          type: 'SUCCESS',
          data: { transactionConfirmations: transactionConfirmations, transactionReceipt: transactionReceipt }
        })
        handlers.confirmation && handlers.confirmation(transactionConfirmations, transactionReceipt)
      }
    }
  }

  function _sendTransaction () {
    dispatch({ type: 'SENDING' })
    sendTransaction(context.library, context.account, method, wrappedHandlers, transactionOptions)
      .catch(error => {
        const transactionErrorCode = TRANSACTION_ERROR_CODES.includes(error.code) ? error.code : undefined
        dispatch({ type: 'ERROR', data: { transactionError: error, transactionErrorCode: transactionErrorCode } })
        handlers.error && handlers.error(error)
      })
  }

  function resetTransaction () { dispatch({ type: 'READY' }) }

  if (!context.account)
    throw Error('useTransactionManager was called without an account in context. Please use an appropriate connector.')

  return [transaction.state, transaction.data, _sendTransaction, resetTransaction, TRANSACTION_ERROR_CODES]
}
