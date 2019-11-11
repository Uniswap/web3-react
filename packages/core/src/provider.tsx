import React, { useContext } from 'react'

import Web3ReactContext from './context'
import useWeb3ReactManager from './manager'

export function useWeb3React() {
  return useContext(Web3ReactContext)
}

interface Web3ReactProviderArguments {
  getLibrary: (provider?: any) => any
  children: any
}

export default function Web3ReactProvider({ getLibrary, children }: Web3ReactProviderArguments): JSX.Element {
  const { connector, provider, chainId, account, activate, setError, deactivate, error } = useWeb3ReactManager()

  const active = connector !== undefined && chainId !== undefined && account !== undefined && !!!error
  const library = active ? getLibrary(provider) : undefined

  return (
    <Web3ReactContext.Provider
      value={{ connector, library, chainId, account, activate, setError, deactivate, active, error }}
    >
      {children}
    </Web3ReactContext.Provider>
  )
}
