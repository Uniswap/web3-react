import { useContext, useEffect, useReducer, useState } from 'react'

import Web3Context from './context'
import { isValidWeb3ContextInterface, IWeb3ContextInterface } from './types'
import {
  getAccountBalance,
  getERC20Balance,
  getEtherscanLink,
  getNetworkName,
  sendTransaction,
  signPersonal,
  TRANSACTION_ERROR_CODES
} from './utilities'

export function useWeb3Context(): IWeb3ContextInterface {
  return useContext(Web3Context)
}

export function useNetworkName(networkId?: number): string | undefined {
  const context = useWeb3Context()
  return context.networkId ? getNetworkName(networkId || context.networkId) : undefined
}

export function useEtherscanLink(type: string, data: string, networkId?: number): string | undefined {
  const context = useWeb3Context()
  return context.networkId ? getEtherscanLink(networkId || context.networkId, type, data) : undefined
}

export function useAccountEffect(effect: React.EffectCallback, depends?: any[]) {
  const context = useWeb3Context()
  const defaultReRenderers = [context.networkId, context.account, context.accountReRenderer]
  useEffect(effect, depends ? [...depends, ...defaultReRenderers] : defaultReRenderers)
}

export function useNetworkEffect(effect: React.EffectCallback, depends?: any[]) {
  const context = useWeb3Context()
  const defaultReRenderers = [context.networkId, context.networkReRenderer]
  useEffect(effect, depends ? [...depends, ...defaultReRenderers] : defaultReRenderers)
}

export function useAccountAndNetworkEffect(effect: React.EffectCallback, depends?: any[]) {
  const context = useWeb3Context()
  const defaultReRenderers = [context.networkId, context.account, context.accountReRenderer, context.networkReRenderer]
  useAccountEffect(effect, depends ? [...depends, ...defaultReRenderers] : defaultReRenderers)
}

export function useAccountBalance({
  address,
  numberOfDigits = 3,
  format
}: { address?: string; numberOfDigits?: number; format?: string } = {}): string | undefined {
  const context = useWeb3Context()
  const [balance, setBalance]: [any, any] = useState(undefined)

  useAccountEffect(() => {
    if (isValidWeb3ContextInterface(context)) {
      const addressToCheck = address ? address : context.account
      if (addressToCheck === null) {
        throw Error('tests')
      }
      getAccountBalance(context.library, addressToCheck, format).then((accountBalance: string) =>
        setBalance(Number(accountBalance).toLocaleString(undefined, { maximumFractionDigits: numberOfDigits }))
      )
    }
  })

  return balance
}

export function useERC20Balance(ERC20Address: string, address: string, numberOfDigits: number = 3): string | undefined {
  const context = useWeb3Context()
  const [ERC20Balance, setERC20Balance]: [undefined | string, any] = useState(undefined)

  useAccountEffect(() => {
    if (isValidWeb3ContextInterface(context)) {
      const addressToCheck = address ? address : context.account
      if (addressToCheck === null) {
        throw Error('tests')
      }
      getERC20Balance(context.library, ERC20Address, context.account || address).then((erc20Balance: string) =>
        setERC20Balance(Number(erc20Balance).toLocaleString(undefined, { maximumFractionDigits: numberOfDigits }))
      )
    }
  })

  return ERC20Balance
}

const initialSignature = {
  data: {
    signature: undefined,
    signatureError: undefined
  },
  state: 'ready'
}

function signatureReducer(state: any, action: any) {
  switch (action.type) {
    case 'READY':
      return initialSignature
    case 'PENDING':
      return { state: 'pending', data: initialSignature.data }
    case 'SUCCESS':
      return { state: 'success', data: { ...state.data, ...action.data } }
    case 'ERROR':
      return { state: 'error', data: { ...state.data, ...action.data } }
    default:
      throw Error('No default case.')
  }
}

export function useSignPersonalManager(message: string, { handlers = {} }: { handlers?: any } = {}) {
  const context = useWeb3Context()

  const [signature, dispatch] = useReducer(signatureReducer, initialSignature)

  function _signPersonal() {
    if (!isValidWeb3ContextInterface(context)) {
      throw Error('No library in context. Ensure your connector is configured correctly.')
    }

    if (context.account === null) {
      throw Error('No account in context. Ensure your connector is configured correctly.')
    }

    dispatch({ type: 'PENDING' })

    signPersonal(context.library, context.account, message)
      .then((receivedSignature: any) => {
        dispatch({ type: 'SUCCESS', data: { receivedSignature } })
        if (handlers.success) {
          handlers.success(receivedSignature)
        }
      })
      .catch((error: Error) => {
        dispatch({ type: 'ERROR', data: { signatureError: error } })
        if (handlers.error) {
          handlers.error(error)
        }
      })
  }

  function resetSignature() {
    dispatch({ type: 'READY' })
  }

  return [signature.state, signature.data, _signPersonal, resetSignature]
}

const initialTransaction = {
  data: {
    transactionConfirmations: undefined,
    transactionError: undefined,
    transactionErrorCode: undefined,
    transactionHash: undefined,
    transactionReceipt: undefined
  },
  state: 'ready'
}

function transactionReducer(state: any, action: any) {
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
      return { state: 'error', data: { ...state.data, ...action.data } }
    default:
      throw Error('No default case.')
  }
}

export function useTransactionManager(
  method: any,
  {
    handlers = {},
    transactionOptions = {},
    maximumConfirmations
  }: { handlers?: any; transactionOptions?: any; maximumConfirmations?: number } = {}
) {
  const context = useWeb3Context()

  const [transaction, dispatch] = useReducer(transactionReducer, initialTransaction)

  const wrappedHandlers = {
    confirmation: (transactionConfirmations: any, transactionReceipt: any) => {
      if (maximumConfirmations && transactionConfirmations <= maximumConfirmations) {
        dispatch({
          data: { transactionConfirmations, transactionReceipt },
          type: 'SUCCESS'
        })
        if (handlers.confirmation) {
          handlers.confirmation(transactionConfirmations, transactionReceipt)
        }
      }
    },
    receipt: (transactionReceipt: any) => {
      dispatch({ type: 'SUCCESS', data: { transactionReceipt } })
      if (handlers.receipt) {
        handlers.receipt(transactionReceipt)
      }
    },
    transactionHash: (transactionHash: any) => {
      dispatch({ type: 'PENDING', data: { transactionHash } })
      if (handlers.transactionHash) {
        handlers.transactionHash(transactionHash)
      }
    }
  }

  function _sendTransaction() {
    if (!isValidWeb3ContextInterface(context)) {
      throw Error('No library in context. Ensure your connector is configured correctly.')
    }

    if (context.account === null) {
      throw Error('No account in context. Ensure your connector is configured correctly.')
    }

    dispatch({ type: 'SENDING' })

    sendTransaction(context.library, context.account, method, wrappedHandlers, transactionOptions).catch(
      (error: any) => {
        const transactionErrorCode = error.code
          ? TRANSACTION_ERROR_CODES.includes(error.code as string)
            ? error.code
            : undefined
          : undefined
        dispatch({ type: 'ERROR', data: { transactionError: error, transactionErrorCode } })
        if (handlers.error) {
          handlers.error(error)
        }
      }
    )
  }

  function resetTransaction() {
    dispatch({ type: 'READY' })
  }

  return [transaction.state, transaction.data, _sendTransaction, resetTransaction, TRANSACTION_ERROR_CODES]
}
