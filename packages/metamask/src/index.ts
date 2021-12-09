import type detectEthereumProvider from '@metamask/detect-provider'
import { Actions, Connector, Provider, ProviderConnectInfo, ProviderRpcError } from '@web3-react/types'

export class NoMetaMaskError extends Error {
  public constructor() {
    super('MetaMask not installed')
    this.name = NoMetaMaskError.name
    Object.setPrototypeOf(this, NoMetaMaskError.prototype)
  }
}

function parseChainId(chainId: string) {
  return Number.parseInt(chainId, 16)
}

export interface AddEthereumChainParameter {
  chainId: number
  chainName: string
  nativeCurrency: {
    name: string
    symbol: string // 2-6 characters long
    decimals: 18
  }
  rpcUrls: string[]
  blockExplorerUrls?: string[]
  iconUrls?: string[] // Currently ignored.
}

export class MetaMask extends Connector {
  private readonly options?: Parameters<typeof detectEthereumProvider>[0]
  private eagerConnection?: Promise<void>

  constructor(actions: Actions, connectEagerly = true, options?: Parameters<typeof detectEthereumProvider>[0]) {
    super(actions)
    this.options = options

    if (connectEagerly) {
      this.eagerConnection = this.initialize(true)
    }
  }

  private async initialize(connectEagerly: boolean): Promise<void> {
    let cancelActivation: () => void
    if (connectEagerly) {
      cancelActivation = this.actions.startActivation()
    }

    return import('@metamask/detect-provider')
      .then((m) => m.default(this.options))
      .then((provider) => {
        this.provider = (provider as Provider) ?? undefined

        if (this.provider) {
          this.provider.on('connect', ({ chainId }: ProviderConnectInfo): void => {
            this.actions.update({ chainId: parseChainId(chainId) })
          })
          this.provider.on('disconnect', (error: ProviderRpcError): void => {
            this.actions.reportError(error)
          })
          this.provider.on('chainChanged', (chainId: string): void => {
            this.actions.update({ chainId: parseChainId(chainId) })
          })
          this.provider.on('accountsChanged', (accounts: string[]): void => {
            this.actions.update({ accounts })
          })

          if (connectEagerly) {
            return Promise.all([
              this.provider.request({ method: 'eth_chainId' }) as Promise<string>,
              this.provider.request({ method: 'eth_accounts' }) as Promise<string[]>,
            ])
              .then(([chainId, accounts]) => {
                if (accounts.length) {
                  this.actions.update({ chainId: parseChainId(chainId), accounts })
                } else {
                  throw new Error('No accounts returned')
                }
              })
              .catch((error) => {
                console.debug('Could not connect eagerly', error)
                cancelActivation()
              })
          }
        }
      })
  }

  public async activate(desiredChainParameters?: number | AddEthereumChainParameter): Promise<void> {
    const desiredChainId =
      typeof desiredChainParameters === 'number' ? desiredChainParameters : desiredChainParameters?.chainId

    this.actions.startActivation()

    if (!this.eagerConnection) {
      this.eagerConnection = this.initialize(false)
    }
    await this.eagerConnection

    if (!this.provider) {
      return this.actions.reportError(new NoMetaMaskError())
    }

    return Promise.all([
      this.provider.request({ method: 'eth_chainId' }) as Promise<string>,
      this.provider.request({ method: 'eth_requestAccounts' }) as Promise<string[]>,
    ])
      .then(([chainId, accounts]) => {
        const receivedChainId = parseChainId(chainId)

        // if there's no desired chain, or it's equal to the received, update
        if (!desiredChainId || receivedChainId === desiredChainId) {
          return this.actions.update({ chainId: receivedChainId, accounts })
        }

        // if we're here, we can try to switch networks
        const desiredChainIdHex = `0x${desiredChainId.toString(16)}`
        return this.provider!.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: desiredChainIdHex }],
        })
          .catch((error) => {
            if (error.code === 4902 && typeof desiredChainParameters !== 'number') {
              // if we're here, we can try to add a new network
              return this.provider!.request({
                method: 'wallet_addEthereumChain',
                params: [{ ...desiredChainParameters, chainId: desiredChainIdHex }],
              })
            } else {
              throw error
            }
          })
          .then(() => {
            this.activate(desiredChainId)
          })
      })
      .catch((error) => {
        this.actions.reportError(error)
      })
  }
}
