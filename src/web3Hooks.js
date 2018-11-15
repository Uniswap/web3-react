import { useContext, useState, useEffect } from 'react'
import { Web3Context } from './index'

export function useRerendererEffect(effect, depends) {
  const context = useContext(Web3Context);
  useEffect(effect, [...depends, context.accountRerenderer, context.accountRerenderer])
}

export function useAccountBalance ({numberOfDigits = 3, format = 'ether'} = {}) {
  const context = useContext(Web3Context);
  const [ balance, setBalance ] = useState(undefined)

  useRerendererEffect(() => {
    context.utilities.getBalance(undefined, format)
      .then(balance => {
        setBalance(Number(balance).toLocaleString(undefined, { maximumFractionDigits: numberOfDigits }))
      })
  }, [context.account])

  return balance
}

export function useERC20Balance (ERC20Address, numberOfDigits = 3) {
  const context = useContext(Web3Context);
  const [ balance, setBalance ] = useState(undefined)

  useRerendererEffect(() => {
    context.utilities.getERC20Balance()
      .then(balance => {
        setBalance(Number(balance).toLocaleString(undefined, { maximumFractionDigits: numberOfDigits }))
      })
  }, [context.account])

  return balance
}
