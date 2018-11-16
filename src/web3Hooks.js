import { useContext, useState, useEffect } from 'react'
import { Web3Context } from './index'

export function useReRendererEffect(effect, depends) {
  const context = useContext(Web3Context);
  useEffect(effect, [...depends, context.accountReRenderer, context.accountReRenderer])
}

export function useAccountBalance ({numberOfDigits = 3, format = 'ether'} = {}) {
  const context = useContext(Web3Context);
  const [ balance, setBalance ] = useState(undefined)

  useReRendererEffect(() => {
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

  useReRendererEffect(() => {
    context.utilities.getERC20Balance()
      .then(balance => {
        setBalance(Number(balance).toLocaleString(undefined, { maximumFractionDigits: numberOfDigits }))
      })
  }, [context.account])

  return balance
}
