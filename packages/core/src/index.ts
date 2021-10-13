import { createWeb3ReactStoreAndActions } from '@web3-react/store'
import { Connector, Web3ReactState, Actions } from '@web3-react/types'
import create, { UseStore } from 'zustand'
import { useEffect, useMemo, useState } from 'react'
import { Web3Provider } from '@ethersproject/providers'

// https://stackoverflow.com/questions/24677592/generic-type-inference-with-class-argument/26696435#26696435
interface IConstructor<T> {
  new (...args: any[]): T
}

export function initializeConnector<T extends Connector>(f: (actions: Actions) => T): [T, UseStore<Web3ReactState>] {
  const [store, actions] = createWeb3ReactStoreAndActions()

  const instance = f(actions)
  const useConnector = create<Web3ReactState>(store)

  return [instance, useConnector]
}

const CHAIN_ID = (state: Web3ReactState) => state.chainId
export function useChainId(useConnector: UseStore<Web3ReactState>): Web3ReactState['chainId'] {
  return useConnector(CHAIN_ID)
}

const ACCOUNTS = (state: Web3ReactState) => state.accounts
export function useAccounts(useConnector: UseStore<Web3ReactState>): Web3ReactState['accounts'] {
  return useConnector(ACCOUNTS)
}
export function useAccount(useConnector: UseStore<Web3ReactState>): string | undefined {
  return useConnector(ACCOUNTS)?.[0]
}

const ACTIVATING = (state: Web3ReactState) => state.activating
export function useActivating(useConnector: UseStore<Web3ReactState>): Web3ReactState['activating'] {
  return useConnector(ACTIVATING)
}

const ERROR = (state: Web3ReactState) => state.error
export function useError(useConnector: UseStore<Web3ReactState>): Web3ReactState['error'] {
  return useConnector(ERROR)
}

export function useProvider(
  connector: InstanceType<typeof Connector>,
  useConnector: UseStore<Web3ReactState>
): Web3Provider | undefined {
  const chainId = useChainId(useConnector)
  const accounts = useAccounts(useConnector)

  return useMemo(() => {
    if (chainId && accounts && connector.provider) {
      return new Web3Provider(connector.provider)
    }
  }, [chainId, accounts, connector.provider])
}

export function useENSNames(
  connector: InstanceType<typeof Connector>,
  useConnector: UseStore<Web3ReactState>
): string[] | undefined {
  const provider = useProvider(connector, useConnector)
  const accounts = useAccounts(useConnector)

  const [ENSNames, setENSNames] = useState<string[] | undefined>(undefined)
  useEffect(() => {
    if (provider && accounts?.length) {
      let stale = false

      Promise.all(accounts.map((account) => provider.lookupAddress(account)))
        .then((ENSNames) => {
          if (!stale) {
            setENSNames(ENSNames)
          }
        })
        .catch((error) => {
          console.debug('Could not fetch ENS names', error)
        })

      return () => {
        stale = true
        setENSNames(undefined)
      }
    }
  }, [provider, accounts])

  return ENSNames
}

export function useENSName(
  connector: InstanceType<typeof Connector>,
  useConnector: UseStore<Web3ReactState>
): string | undefined {
  const provider = useProvider(connector, useConnector)
  const account = useAccount(useConnector)

  const [ENSName, setENSName] = useState<string | undefined>(undefined)
  useEffect(() => {
    if (provider && account) {
      let stale = false

      provider
        .lookupAddress(account)
        .then((ENSName) => {
          if (!stale) {
            setENSName(ENSName)
          }
        })
        .catch((error) => {
          console.debug('Could not fetch ENS name', error)
        })

      return () => {
        stale = true
        setENSName(undefined)
      }
    }
  }, [provider, account])

  return ENSName
}
