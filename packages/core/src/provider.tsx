import React, { useMemo } from 'react'

import { Web3ReactContextInterface } from './types'
import { Web3ReactContext } from './context'
import useWeb3ReactManager from './manager'
import { getAddress } from './address'

interface Web3ReactProviderArguments {
  getLibrary: (provider: any) => any
  children: any
}

export function Web3ReactProvider({ getLibrary, children }: Web3ReactProviderArguments): JSX.Element {
  const {
    connector,
    provider,
    chainId,
    account: _account,

    activate,
    activateFirst,
    setError,
    deactivate,

    error
  } = useWeb3ReactManager()
  const account = useMemo(() => (typeof _account === 'string' ? getAddress(_account) : _account), [_account])

  const active = connector !== undefined && chainId !== undefined && account !== undefined && !!!error
  const library = useMemo(() => (active ? getLibrary(provider) : undefined), [active, getLibrary, provider])

  const web3ReactContext: Web3ReactContextInterface = {
    connector,
    library,
    chainId,
    account,

    activate,
    activateFirst,
    setError,
    deactivate,

    active,
    error
  }

  return <Web3ReactContext.Provider value={web3ReactContext}>{children}</Web3ReactContext.Provider>
}
