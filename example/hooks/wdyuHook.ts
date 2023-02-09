import React from 'react'

interface FromTo {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  from: any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  to: any
}

type Changes = Record<string, FromTo>

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type GenericProps = Record<string, any>

export default function useWhyDidYouUpdate(name: string, props: GenericProps): void {
  const previousProps = React.useRef<GenericProps>(props)

  React.useEffect(() => {
    if (previousProps && previousProps.current) {
      const allKeys = Object.keys({ ...previousProps.current, ...props })

      const changes: Changes = {}

      allKeys.forEach((key) => {
        if (previousProps.current[key] !== props[key]) {
          changes[key] = {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            from: previousProps.current[key],
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            to: props[key],
          }
        }
      })

      if (Object.keys(changes).length) {
        console.log('[why-did-you-update]', name, changes)
      }
    }

    previousProps.current = props
  })
}
