import { useContext, useState, useEffect } from 'react'
import { Web3Context } from './Web3Context'

export const useAccountBalance = (numberOfDigits = 3) => {
  const context = useContext(Web3Context);

  const [ balance, setBalance ] = useState(undefined)

  useEffect(() => {
    context.utilities.getBalance(context.account)
      .then(balance => {
        setBalance(Number(balance).toLocaleString(undefined, { maximumFractionDigits: numberOfDigits }))
      })
  }, [context.account, context._accountRerender])

  return balance
}
