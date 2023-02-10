import { formatUnits } from '@ethersproject/units'
import type { Web3ReactHooks } from '@web3-react/core'
import type { Connector } from '@web3-react/types'
import Image from 'next/image'

import { useBalances } from '../../../hooks/web3Hooks'
import { CHAINS } from '../../../utils/chains'
import CircleLoader from '../../feedback/CircleLoader'
import AddressEllipsis from './AddressEllipsis'
import Blockies from './Blockies'
import SpacerView from './SpacerView'

export default function AccountsView({
  connector,
  provider,
  accountIndex,
  accounts,
  chainId,
  ENSNames,
  ENSAvatars,
  showOnlySelected,
}: {
  connector: Connector
  provider?: ReturnType<Web3ReactHooks['useProvider']>
  accountIndex: ReturnType<Web3ReactHooks['useAccountIndex']>
  accounts: ReturnType<Web3ReactHooks['useAccounts']>
  chainId: ReturnType<Web3ReactHooks['useChainId']>
  ENSNames: ReturnType<Web3ReactHooks['useENSNames']>
  ENSAvatars: ReturnType<Web3ReactHooks['useENSAvatars']>
  showOnlySelected?: boolean
}) {
  const { balances, isLoading } = useBalances(connector, provider, chainId, accounts, false)

  if (accounts === undefined) return null

  const accountData = accounts
    .map((address, index) => ({
      account: address,
      ensName: ENSNames?.[index] ?? '',
      ensAvatar: ENSAvatars?.[index] ?? '',
      balance: balances?.[index] ?? '0',
    }))
    .slice(showOnlySelected ? accountIndex : 0, showOnlySelected ? Number(accountIndex) + 1 : accounts.length)

  return (
    !!accountData?.length && (
      <>
        <SpacerView />
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            justifyContent: 'center',
          }}
        >
          {accountData.map((accountInfo, index) => {
            const { account, ensName, ensAvatar, balance } = accountInfo ?? {}

            if (!account) return null

            return (
              <div
                key={account}
                style={{
                  overflow: 'hidden',
                  width: `calc(100% - 24px)`,
                  maxWidth: '100%',
                  backgroundColor:
                    account === accounts[accountIndex] ? 'rgba(56, 253, 72, 0.15)' : 'rgba(255, 255, 255, 0.1)',
                  borderRadius: '14px',
                  minHeight: '44px',
                  outline: '2px solid',
                  outlineColor: account === accounts[accountIndex] ? 'rgba(56, 253, 72, 0.4)' : 'transparent',
                  marginTop: index !== 0 ? 16 : 0,
                  padding: '12px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-around',
                  alignItems: 'flex-start',
                }}
              >
                <div
                  style={{
                    display: 'inline-flex',
                    justifyContent: 'flex-start',
                    alignItems: 'center',
                    overflow: 'hidden',
                    maxWidth: '100%',
                    marginBottom: '0.5em',
                  }}
                >
                  {ensAvatar ? (
                    <Image
                      alt="ENS Avatar"
                      src={ensAvatar}
                      width={24}
                      height={24}
                      style={{ marginRight: '8px', borderRadius: '50%', overflow: 'hidden' }}
                    />
                  ) : (
                    <Blockies diameter={24} account={account} alt={account} />
                  )}
                  <AddressEllipsis connector={connector} account={account} ensName={ensName} />
                </div>
                <div
                  style={{
                    display: 'inline-flex',
                    justifyContent: 'flex-start',
                    alignItems: 'center',
                  }}
                >
                  <p style={{ margin: 0, fontSize: '0.8em', marginRight: '0.5em' }}>Ξ</p>
                  {isLoading ? (
                    <CircleLoader />
                  ) : !!balance && !!chainId ? (
                    <p style={{ margin: 0, fontSize: '0.8em' }}>
                      {` ${new Intl.NumberFormat(undefined).format(
                        Number(formatUnits(balance, CHAINS[chainId].nativeCurrency.decimals))
                      )}
                    `}
                    </p>
                  ) : null}
                </div>
              </div>
            )
          })}
        </div>
      </>
    )
  )
}
