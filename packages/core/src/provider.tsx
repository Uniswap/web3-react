import React, { createContext, useContext, useMemo } from 'react'
import invariant from 'tiny-invariant'

import { Web3ReactContextInterface } from './types'
import { useWeb3ReactManager } from './manager'

const PRIMARY_KEY = 'primary'
const CONTEXTS: { [key: string]: React.Context<Web3ReactContextInterface> } = {}

interface Web3ReactProviderArguments {
  getLibrary: (provider: any) => any
  children: any
}

export function createWeb3ReactRoot(key: string): (args: Web3ReactProviderArguments) => JSX.Element {
  invariant(!CONTEXTS[key], `A root already exists for provided key ${key}`)

  CONTEXTS[key] = createContext<Web3ReactContextInterface>({
    activate: async () => {
      invariant(false, 'No <Web3ReactProvider ... /> found.')
    },
    setError: () => {
      invariant(false, 'No <Web3ReactProvider ... /> found.')
    },
    deactivate: () => {
      invariant(false, 'No <Web3ReactProvider ... /> found.')
    },
    active: false
  })

  const Provider = CONTEXTS[key].Provider

  return function Web3ReactProvider({ getLibrary, children }: Web3ReactProviderArguments): JSX.Element {
    const {
      connector,
      provider,
      chainId,
      account,

      activate,
      setError,
      deactivate,

      error
    } = useWeb3ReactManager()

    const active = connector !== undefined && chainId !== undefined && account !== undefined && !!!error
    const library = useMemo(() => (active ? getLibrary(provider) : undefined), [active, getLibrary, provider])

    const web3ReactContext: Web3ReactContextInterface = {
      connector,
      library,
      chainId,
      account,

      activate,
      setError,
      deactivate,

      active,
      error
    }

    return <Provider value={web3ReactContext}>{children}</Provider>
  }
}

export const Web3ReactProvider = createWeb3ReactRoot(PRIMARY_KEY)

export function useWeb3React<T = any>(key: string = PRIMARY_KEY): Web3ReactContextInterface<T> {
  invariant(Object.keys(CONTEXTS).includes(key), `Invalid key ${key}`)
  return useContext(CONTEXTS[key])
}
