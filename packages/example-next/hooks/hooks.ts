import { useCallback, useEffect, useRef, useState } from 'react'

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
