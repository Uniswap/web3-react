import type { Web3ReactHooks } from '@web3-react/core'
import { CHAINS } from '../chains/chains'

export function Chain({
  chainId,
  addingChain,
  switchingChain,
}: {
  chainId: ReturnType<Web3ReactHooks['useChainId']>
  addingChain?: ReturnType<Web3ReactHooks['useAddingChain']>
  switchingChain?: ReturnType<Web3ReactHooks['useSwitchingChain']>
}) {
  if (chainId === undefined) return null

  const prefix = addingChain ? 'Adding ' : switchingChain ? 'Switching ' : ''

  return (
    <div>
      {`${prefix}Chain: `}
      <b>
        {addingChain
          ? `${CHAINS[addingChain.chainId]?.name ?? addingChain.chainId}`
          : switchingChain
          ? `${
              switchingChain?.fromChainId ? CHAINS[switchingChain.fromChainId]?.name ?? switchingChain.fromChainId : ''
            } to ${CHAINS[switchingChain.toChainId]?.name ?? switchingChain.toChainId}`
          : `${CHAINS[chainId]?.name ?? chainId}`}
      </b>
    </div>
  )
}
