import type { BigNumber } from '@ethersproject/bignumber'
import type { Web3ReactHooks } from '@web3-react/core'
import { useCallback, useEffect, useRef, useState } from 'react'

export function useBalances(
  provider?: ReturnType<Web3ReactHooks['useProvider']>,
  accounts?: string[]
): BigNumber[] | undefined {
  const [balances, setBalances] = useState<BigNumber[] | undefined>()

  useEffect(() => {
    if (provider && accounts?.length) {
      let stale = false

      void Promise.all(accounts.map((account) => provider.getBalance(account))).then((balances) => {
        if (stale) return
        setBalances(balances)
      })

      return () => {
        stale = true
        setBalances(undefined)
      }
    }
  }, [provider, accounts])

  return balances
}

export const useTimeout = ({
  callback,
  startOnMount = false,
  timeout = 1_000,
}: {
  callback?: () => void
  startOnMount: boolean
  timeout: number
}) => {
  const timeoutIdRef = useRef(undefined)
  const [isTimedOut, setIsTimedOut] = useState(false)

  const onFinished = useCallback(() => {
    setIsTimedOut(false)
    callback?.()
  }, [callback])

  const cancel = useCallback(() => {
    const timeoutId = timeoutIdRef.current
    if (timeoutId) {
      timeoutIdRef.current = null
      setIsTimedOut(false)
      clearTimeout(timeoutId)
    }
  }, [timeoutIdRef])

  const start = useCallback(() => {
    // if (isTimedOut) clearTimeout(timeoutIdRef.current)

    timeoutIdRef.current = setTimeout(onFinished, timeout)
    setIsTimedOut(true)
  }, [onFinished, timeout])

  useEffect(() => {
    if (startOnMount) start()
    return cancel
  }, [callback, timeout, cancel, startOnMount, start])

  return { start, cancel, isTimedOut }
}
