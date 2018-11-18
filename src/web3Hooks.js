import { useState, useEffect, useContext, useMemo } from 'react'

import Web3Context from './Web3Context'
import {
  getNetworkName, getEtherscanLink, getAccountBalance, getERC20Balance,
  signPersonal, sendTransaction, TRANSACTION_ERRORS
} from './web3Utilities'

export function useWeb3Context () {
  return useContext(Web3Context)
}

export function useNetworkName (networkId) {
  const context = useWeb3Context()
  return useMemo(() => getNetworkName(networkId || context.networkId), [networkId, context.networkId])
}

export function useEtherscanLink (networkId, type, data) {
  const context = useWeb3Context()
  return useMemo(
    () => getEtherscanLink(networkId || context.networkId, type, data), [networkId, context.networkId, type, data]
  )
}

export function useAccountEffect(effect, depends) {
  const context = useWeb3Context()
  useEffect(effect, [...depends, context.account, context.accountReRenderer])
}

export function useNetworkEffect(effect, depends) {
  const context = useWeb3Context()
  useEffect(effect, [...depends, context.networkId, context.networkReRenderer])
}

export function useAccountBalance (address, {numberOfDigits = 3, format} = {}) {
  const context = useWeb3Context()
  const [ balance, setBalance ] = useState(undefined)

  useAccountEffect(() => {
    getAccountBalance(context.web3js, address || context.account, format)
      .then(balance =>
        setBalance(Number(balance).toLocaleString(undefined, { maximumFractionDigits: numberOfDigits }))
      )
  }, [context.networkId])

  return balance
}

export function useERC20Balance (ERC20Address, address, numberOfDigits = 3) {
  const context = useWeb3Context()
  const [ ERC20Balance, setERC20Balance ] = useState(undefined)

  useAccountEffect(() => {
    getERC20Balance(context.web3js, ERC20Address, address || context.account)
      .then(balance =>
        setERC20Balance(Number(balance).toLocaleString(undefined, { maximumFractionDigits: numberOfDigits }))
      )
  }, [context.networkId])

  return ERC20Balance
}

export function useSignPersonal () {
  const context = useWeb3Context()
  function wrappedSignPersonal (message) {
    return signPersonal(context.web3js, context.account, message)
  }
  return wrappedSignPersonal
}

export function useSendTransaction () {
  const context = useWeb3Context()
  function wrappedSendTransaction (method, handlers, transactionOptions) {
    return sendTransaction(context.web3js, context.account, method, handlers, transactionOptions)
  }
  return [wrappedSendTransaction, TRANSACTION_ERRORS]
}
