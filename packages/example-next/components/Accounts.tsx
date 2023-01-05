import type { Web3ReactHooks } from '@web3-react/core'
import { formatEther } from '@ethersproject/units'
import { useBalances } from '../hooks/hooks'
import Address from './Address'
import Spacer from './Spacer'

export function Accounts({
  accountIndex,
  accounts,
  provider,
  ENSNames,
  ENSAvatars,
}: {
  accountIndex: ReturnType<Web3ReactHooks['useAccountIndex']>
  accounts: ReturnType<Web3ReactHooks['useAccounts']>
  provider: ReturnType<Web3ReactHooks['useProvider']>
  ENSNames: ReturnType<Web3ReactHooks['useENSNames']>
  ENSAvatars: ReturnType<Web3ReactHooks['useENSAvatars']>
}) {
  const balances = useBalances(provider, accounts)

  if (accounts === undefined) return null

  const accountData = accounts.map((address, index) => ({
    account: address,
    ensName: ENSNames?.[index] ?? '',
    ensAvatar: ENSAvatars?.[index] ?? '',
  }))

  return (
    !!accountData?.length && (
      <>
        <Spacer />
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            justifyContent: 'center',
          }}
        >
          {accountData.map((accountInfo, index) => {
            const { account: address, ensName, ensAvatar } = accountInfo ?? {}
            const balance = balances?.[index] ?? 0

            if (!address) return null

            return (
              <div
                key={address}
                style={{
                  overflow: 'hidden',
                  width: `calc(100% - 24px)`,
                  maxWidth: '100%',
                  backgroundColor:
                    address === accounts[accountIndex] ? 'rgba(56, 253, 72, 0.15)' : 'rgba(255, 255, 255, 0.1)',
                  borderRadius: '14px',
                  minHeight: '44px',
                  outline: '2px solid',
                  outlineColor: address === accounts[accountIndex] ? 'rgba(56, 253, 72, 0.4)' : 'transparent',
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
                  }}
                >
                  {ensAvatar && (
                    <img
                      src={ensAvatar}
                      style={{ width: 24, height: 24, marginRight: '8px', borderRadius: '50%', overflow: 'hidden' }}
                    />
                  )}
                  <Address account={address} ensName={ensName} />
                </div>
                <p style={{ margin: 0, fontSize: '0.8em' }}>{balance ? ` Ξ ${formatEther(balance)}` : null}</p>
              </div>
            )
          })}
        </div>
      </>
    )
  )
}
