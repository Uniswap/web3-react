import type { YoroiProvider } from '@web3-react/yoroi'
import type { NamiProvider } from '@web3-react/nami'

import { useCallback, useEffect, useState } from 'react'

import { BigNumber } from '@ethersproject/bignumber'
import { Web3Provider } from '@ethersproject/providers'

import { Web3ReactHooks } from '@web3-react/core'

import { PhantomWallet } from '@web3-react/phantom'
import { SolflareWallet } from '@web3-react/solflare'
import { TronLink } from '@web3-react/tron-link'
import { Connector } from '@web3-react/types'
import { YoroiWallet } from '@web3-react/yoroi'
import { NamiWallet } from '@web3-react/nami'

import { PublicKey } from '@solana/web3.js'
import * as CardanoWasm from '@emurgo/cardano-serialization-lib-browser'

/**
 * @param subscribe - Whether to poll data
 * @param skip - Whether to prevent state execution
 */
export function useBlockNumber(
  connector: Connector,
  provider?: ReturnType<Web3ReactHooks['useProvider']>,
  chainId?: ReturnType<Web3ReactHooks['useChainId']>,
  subscribe?: boolean,
  skip?: boolean
): { blockNumber: number; isLoading: boolean; error: Error; fetch: () => Promise<void> } {
  const [error, setError] = useState<Error>(undefined)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [blockNumber, setBlockNumber] = useState<number>(0)

  const getBlock = useCallback(async (): Promise<number> => {
    if (!connector) {
      return 0
    }

    // Solana Connectors
    if (connector instanceof PhantomWallet || connector instanceof SolflareWallet) {
      if (!connector.connection?.getBlockHeight) return
      return await connector.connection.getBlockHeight()
    }

    // Cardano Connectors
    else if (connector instanceof YoroiWallet || connector instanceof NamiWallet) {
      return 0
    }

    // Tron Connectors
    else if (connector instanceof TronLink) {
      const res = await connector.customProvider.trx.getCurrentBlock()
      return res?.block_header?.raw_data?.number ?? 0
    }

    // EVM Connectors
    else {
      return await provider.getBlockNumber()
    }
  }, [connector, provider])

  const fetch = useCallback(async () => {
    setError(undefined)

    if (!provider || !connector) {
      setBlockNumber(0)
      return
    }

    setIsLoading(true)

    try {
      setBlockNumber(await getBlock())
    } catch (error) {
      setError(error)
    }

    setIsLoading(false)
  }, [connector, getBlock, provider])

  useEffect(() => {
    if (skip) return

    setError(undefined)

    if (!provider || !connector) {
      setBlockNumber(0)
      return
    }

    let stale = false

    setIsLoading(true)

    // Get block at least once
    void getBlock()
      .then((block) => {
        if (stale) return
        setBlockNumber(block)
        setIsLoading(false)
      })
      .catch((error: Error) => {
        setBlockNumber(0)
        setError(error)
        setIsLoading(false)
      })

    // Only EVM Connectors for now
    if (provider?.on && !skip) {
      const updateBlock = (blockNumber: number) => {
        if (!blockNumber || stale) return

        setBlockNumber(blockNumber)
        setIsLoading(false)
      }

      if (!subscribe) {
        return () => {
          stale = true
        }
      }

      provider.on?.('block', (blockNumber: number) => void updateBlock(blockNumber))

      return () => {
        provider.off?.('block', (blockNumber: number) => void updateBlock(blockNumber))
        stale = true
      }
    }
  }, [
    provider,
    subscribe,
    skip,
    getBlock,
    connector,
    chainId, // Forces fetch on chain change
  ])

  return { blockNumber, isLoading, error, fetch }
}

export function useBalances(
  connector?: Connector,
  provider?: ReturnType<Web3ReactHooks['useProvider']>,
  chainId?: ReturnType<Web3ReactHooks['useChainId']>,
  accounts?: string[],
  subscribe?: boolean
): { balances: BigNumber[]; isLoading: boolean; error: Error; fetch: () => Promise<void> } {
  const [error, setError] = useState<Error>()
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [balances, setBalances] = useState<BigNumber[]>(
    new Array<BigNumber>(accounts?.length ?? 0).fill(BigNumber.from(0))
  )

  // Used to update balance on every block update, if subscribed
  const { blockNumber } = useBlockNumber(connector, provider, chainId, subscribe, !subscribe)

  const getBalances = useCallback(async (): Promise<BigNumber[]> => {
    if (!provider || !accounts?.length) {
      return new Array<BigNumber>(accounts?.length ?? 0).fill(BigNumber.from(0))
    }

    // Solana Connectors
    if (connector instanceof PhantomWallet || connector instanceof SolflareWallet) {
      const pubKeys = accounts.map((account) => new PublicKey(account))

      const balances = (
        await Promise.all(pubKeys.map((pubKey: PublicKey) => connector.connection.getBalance(pubKey)))
      ).map((balance) => BigNumber.from(balance))

      return balances
    }

    // Cardano Connectors
    else if (connector instanceof YoroiWallet) {
      const cborBalance = await (provider as unknown as YoroiProvider).getBalance()

      const bytes = Buffer.from(cborBalance, 'hex')
      const value = CardanoWasm.Value.from_bytes(bytes)
      const balance = value.coin().to_str()

      return [BigNumber.from(balance)]
    } else if (connector instanceof NamiWallet) {
      const cborBalance = await (provider as unknown as NamiProvider).getBalance()

      const bytes = Buffer.from(cborBalance, 'hex')
      const value = CardanoWasm.Value.from_bytes(bytes)
      const balance = value.coin().to_str()

      return [BigNumber.from(balance)]
    }

    // Tron Connectors
    else if (connector instanceof TronLink) {
      const balances = (
        await Promise.all(
          accounts.map((account: string) =>
            connector.customProvider.trx.getBalance(connector.convertAddressTo41(account))
          )
        )
      ).map((amountSun) => BigNumber.from(amountSun))

      return balances
    }

    // EVM Connectors
    else {
      const balances = await Promise.all(accounts.map((account: string) => provider.getBalance(account)))

      return balances
    }
  }, [accounts, connector, provider])

  const fetch = useCallback(async () => {
    setIsLoading(true)

    const balances = await getBalances()

    setBalances(balances)
    setIsLoading(false)
  }, [getBalances])

  useEffect(() => {
    setIsLoading(true)

    let stale = false

    void getBalances()
      .then((userBalances) => {
        if (stale) return
        setBalances(userBalances)
        setIsLoading(false)
      })
      .catch((error: Error) => {
        if (stale) return
        setBalances([])
        setError(error)
        setIsLoading(false)
      })

    return () => {
      stale = true
    }
  }, [
    getBalances,
    blockNumber, // Used to trigger on every block, if subscribed.
    chainId, // Forces fetch on chain change.
  ])

  return { balances, isLoading, error, fetch }
}

/**
 * @param subscribe - Whether to poll data
 */
export function useBalance(
  connector?: Connector,
  provider?: ReturnType<Web3ReactHooks['useProvider']>,
  chainId?: ReturnType<Web3ReactHooks['useChainId']>,
  account?: string,
  subscribe?: boolean
): { balance: BigNumber; isLoading: boolean; fetch: () => Promise<void> } {
  const { balances, isLoading, fetch } = useBalances(connector, provider, chainId, [account], subscribe)

  return { balance: balances[0], isLoading, fetch }
}

/**
 *
 */
export function useSignMessage({
  connector,
  provider,
  account,
  onSigned,
  onRejected,
}: {
  connector?: Connector
  provider?: Web3Provider
  account?: string
  onSigned?: () => void
  onRejected?: () => void
}): { signMessage: () => Promise<void>; isLoading: boolean } {
  const [isLoading, setIsLoading] = useState(false)

  const signMessage = useCallback(async () => {
    if (!provider || !account) return
    setIsLoading(true)

    const message = 'Sign me!'

    try {
      if (provider?.getSigner) {
        // EVM Connectors
        const signer = provider.getSigner(account)
        await signer.signMessage(message)
        onSigned?.()
      } else if (connector instanceof PhantomWallet || connector instanceof SolflareWallet) {
        // Solana Connectors
        await connector.customProvider.signMessage(new TextEncoder().encode(message))
        onSigned?.()
      } else if (connector instanceof YoroiWallet || connector instanceof NamiWallet) {
        // Cardano Connectors

        const messageHex = Buffer.from(message).toString('hex')

        if (connector instanceof YoroiWallet) {
          const sig = await connector.auth.signHexPayload(messageHex)
          await connector.auth.checkHexPayload(messageHex, sig)

          onSigned?.()
        } else if (connector instanceof NamiWallet) {
          await connector.customProvider.signData(account, messageHex)

          onSigned?.()
        }
      } else if (connector instanceof TronLink) {
        // Tron Connectors
        await connector.customProvider.trx.sign(connector.customProvider.toHex(message))
        onSigned?.()
      }
    } catch (error) {
      onRejected?.()
    }

    setIsLoading(false)
  }, [account, connector, provider, onSigned, onRejected])

  return { signMessage, isLoading: isLoading }
}
