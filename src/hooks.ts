import { useState, useEffect, useContext, useReducer } from 'react'

import { Web3ContextInterface, isValidWeb3ContextInterface } from './types'
import Web3Context from './context'
import {
  getNetworkName, getEtherscanLink, getAccountBalance, getERC20Balance,
  signPersonal, sendTransaction, TRANSACTION_ERROR_CODES
} from './utilities'

export function useWeb3Context (): Web3ContextInterface  {
  return useContext(Web3Context)
}

export function useNetworkName (networkId?: number): string | undefined {
  const context = useWeb3Context()
  return context.networkId ? getNetworkName(networkId || context.networkId) : undefined
}

export function useEtherscanLink (type: string, data: string, networkId?: number): string | undefined {
  const context = useWeb3Context()
  return context.networkId ? getEtherscanLink(networkId || context.networkId, type, data) : undefined
}

export function useAccountEffect(effect: React.EffectCallback, depends?: Array<any>) {
  const context = useWeb3Context()
  const defaultReRenderers = [context.networkId, context.account, context.accountReRenderer]
  useEffect(effect, depends ? [...depends, ...defaultReRenderers] : defaultReRenderers)
}

export function useNetworkEffect(effect: React.EffectCallback, depends?: Array<any>) {
  const context = useWeb3Context()
  const defaultReRenderers = [context.networkId, context.networkReRenderer]
  useEffect(effect, depends ? [...depends, ...defaultReRenderers] : defaultReRenderers)
}

export function useAccountAndNetworkEffect(effect: React.EffectCallback, depends?: Array<any>) {
  const context = useWeb3Context()
  const defaultReRenderers = [
    context.networkId, context.account, context.accountReRenderer, context.networkReRenderer
  ]
  useAccountEffect(effect, depends ? [...depends, ...defaultReRenderers] : defaultReRenderers)
}

export function useAccountBalance (
  { address, numberOfDigits = 3, format }: { address?: string, numberOfDigits?: number, format?: string } = {}
): string | undefined {
  const context = useWeb3Context()
  const [ balance, setBalance ]: [string | undefined, Function] = useState(undefined)

  useAccountEffect(() => {
    if (isValidWeb3ContextInterface(context)) {
      const addressToCheck = address ? address : context.account
      if (addressToCheck === null) throw Error('tests')
      getAccountBalance(context.library, addressToCheck, format)
        .then((balance: string) =>
          setBalance(Number(balance).toLocaleString(undefined, { maximumFractionDigits: numberOfDigits }))
        )
    }
  })

  return balance
}

export function useERC20Balance (ERC20Address: string, address: string, numberOfDigits: number = 3): string | undefined {
  const context = useWeb3Context()
  const [ ERC20Balance, setERC20Balance ]: [string | undefined, Function] = useState(undefined)

  useAccountEffect(() => {
    if (isValidWeb3ContextInterface(context)) {
      const addressToCheck = address ? address : context.account
      if (addressToCheck === null) throw Error('tests')
      getERC20Balance(context.library, ERC20Address, context.account || address)
        .then((balance: string) =>
          setERC20Balance(Number(balance).toLocaleString(undefined, { maximumFractionDigits: numberOfDigits }))
        )
    }
  })

  return ERC20Balance
}

const initialSignature = {
  state: 'ready',
  data: {
    signature:      undefined,
    signatureError: undefined
  }
}

function signatureReducer (state: any, action: any) {
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

export function useSignPersonalManager (message: string, { handlers = {} }: { handlers?: any } = {}) {
  const context = useWeb3Context()

  const [signature, dispatch] = useReducer(signatureReducer, initialSignature)

  function _signPersonal () {
    if (!isValidWeb3ContextInterface(context))
      throw Error('No library in context. Ensure your connector is configured correctly.')

    if (context.account === null)
      throw Error('No account in context. Ensure your connector is configured correctly.')

    dispatch({ type: 'PENDING' })

    signPersonal(context.library, context.account, message)
      .then((signature: any) => {
        dispatch({ type: 'SUCCESS', data: { signature: signature } })
        handlers.success && handlers.success(signature)
      })
      .catch((error: Error) => {
        dispatch({ type: 'ERROR', data: { signatureError: error } })
        handlers.error && handlers.error(error)
      })
  }

  function resetSignature () { dispatch({ type: 'READY' }) }

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

function transactionReducer (state: any, action: any) {
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
  method: any,
  { handlers = {}, transactionOptions = {}, maximumConfirmations }:
  { handlers?: any, transactionOptions?: any, maximumConfirmations?: number } = {}
) {
  const context = useWeb3Context()

  const [transaction, dispatch] = useReducer(transactionReducer, initialTransaction)

  const wrappedHandlers = {
    transactionHash: (transactionHash: any) => {
      dispatch({ type: 'PENDING', data: { transactionHash: transactionHash } })
      handlers.transactionHash && handlers.transactionHash(transactionHash)
    },
    receipt: (transactionReceipt: any) => {
      dispatch({ type: 'SUCCESS', data: { transactionReceipt: transactionReceipt } })
      handlers.receipt && handlers.receipt(transactionReceipt)
    },
    confirmation: (transactionConfirmations: any, transactionReceipt: any) => {
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
    if (!isValidWeb3ContextInterface(context))
      throw Error('No library in context. Ensure your connector is configured correctly.')

    if (context.account === null)
      throw Error('No account in context. Ensure your connector is configured correctly.')

    dispatch({ type: 'SENDING' })

    sendTransaction(context.library, context.account, method, wrappedHandlers, transactionOptions)
      .catch((error: any) => {
        const transactionErrorCode = error.code ?
          (TRANSACTION_ERROR_CODES.includes(error.code as string) ? error.code : undefined) :
          undefined
        dispatch({ type: 'ERROR', data: { transactionError: error, transactionErrorCode: transactionErrorCode } })
        handlers.error && handlers.error(error)
      })
  }

  function resetTransaction () { dispatch({ type: 'READY' }) }

  return [transaction.state, transaction.data, _sendTransaction, resetTransaction, TRANSACTION_ERROR_CODES]
}
