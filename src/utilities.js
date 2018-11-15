import { useState } from 'react'

export const useThrottled = (functionToThrottle, interval, initialLastCalled = 0) => {
  const [lastCalled, setLastCalled] = useState(initialLastCalled)

  return function throttle () {
    const now = Date.now()
    if (now >= lastCalled + interval) {
      setLastCalled(now)
      functionToThrottle()
    }
  }
}
