import { useState } from 'react'

export const useThrottled = (functionToThrottle, interval) => {
  const [lastCalled, setLastCalled] = useState(0)

  return function throttle () {
    const now = Date.now()
    if (now >= lastCalled + interval) {
      setLastCalled(now)
      functionToThrottle()
    }
  }
}
