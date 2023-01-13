import type { Web3ReactHooks } from '@web3-react/core'
import { CHAINS } from '../utils/chains'

export function Chain({
  chainId,
  addingChain,
  switchingChain,
  blockNumber,
}: {
  chainId: ReturnType<Web3ReactHooks['useChainId']>
  addingChain?: ReturnType<Web3ReactHooks['useAddingChain']>
  switchingChain?: ReturnType<Web3ReactHooks['useSwitchingChain']>
  blockNumber?: number
}) {
  if (chainId === undefined) return null

  const prefix = addingChain ? 'Adding ' : switchingChain ? 'Switching ' : ''

  const getText = () => {
    if (addingChain) {
      const name = CHAINS[addingChain.chainId]?.name
      return name ? `${name} ${addingChain.chainId}` : addingChain.chainId
    }

    if (switchingChain) {
      const fromName = switchingChain?.fromChainId
        ? CHAINS[switchingChain.fromChainId]?.name ?? switchingChain.fromChainId
        : ''
      const toName = switchingChain?.toChainId ? CHAINS[switchingChain.toChainId]?.name ?? switchingChain.toChainId : ''

      return `${fromName} to ${toName}`
    }

    return CHAINS[chainId]?.name ? `${CHAINS[chainId]?.name} (${chainId})` : chainId
  }

  return (
    <div>
      <div>
        {`${prefix}Network: `}
        <b>{getText()}</b>
      </div>
      {!!blockNumber && (
        <div style={{ marginTop: 4 }}>
          {`Block: `}
          <b>{blockNumber}</b>
        </div>
      )}
    </div>
  )
}
