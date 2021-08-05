import { ConnectorUpdate } from '@web3-react/types'
import { AbstractConnector } from '@web3-react/abstract-connector'
import { IWalletConnectProviderOptions } from '@walletconnect/types'

import type { ClientTypes, IClient, PairingTypes, SessionTypes } from '@walletconnect/types'
import { CLIENT_EVENTS } from '@walletconnect/client'

export const URI_AVAILABLE = 'URI_AVAILABLE'

export interface WalletConnectConnectorArguments extends IWalletConnectProviderOptions, ClientTypes.ConnectParams {}

function getSupportedChains({ permissions: { blockchain } }: WalletConnectConnectorArguments): string[] {
  return blockchain.chains
}

export class WalletConnectConnector extends AbstractConnector {
  private readonly config: WalletConnectConnectorArguments

  public walletConnectProvider?: IClient

  override supportedChainIds: string[] // override doesn't seem ot be working

  session?: SessionTypes.Settled

  constructor(config: WalletConnectConnectorArguments) {
    super({})
    this.supportedChainIds = getSupportedChains(config)
    this.config = config
    this.session = undefined
  }

  public async activate(): Promise<ConnectorUpdate> {
    if (!this.walletConnectProvider) {
      const WalletConnectProvider = await import('@walletconnect/client').then((m) => m.default)
      this.walletConnectProvider = await WalletConnectProvider.init(this.config)
    }

    this.walletConnectProvider.on(CLIENT_EVENTS.pairing.proposal, async (proposal: PairingTypes.Proposal) => {
      this.emit(URI_AVAILABLE, proposal.signal.params.uri)
    })

    const session = await this.walletConnectProvider?.connect({
      permissions: {
        ...this.config.permissions,
        blockchain: {
          ...this.config.permissions.blockchain,
          chains: this.supportedChainIds,
        },
        jsonrpc: this.config.permissions.jsonrpc,
      },
    })

    this.session = session

    this.walletConnectProvider.on(CLIENT_EVENTS.session.updated, this.handleSessionUpdate)
    this.walletConnectProvider.on(CLIENT_EVENTS.session.deleted, this.handleSessionDelete)

    return { provider: this.walletConnectProvider, account: session.state.accounts[0] }
  }

  public handleSessionUpdate(update: SessionTypes.Update) {
    this.emitUpdate({ account: update.state.accounts?.[0] })
  }

  public handleSessionDelete(/* */) {
    /** dk what to put here yet */
  }

  public async getProvider(): Promise<any> {
    return this.walletConnectProvider
  }

  public async getChainId(): Promise<number | string> {
    /** WC v2 is multi-chain, how do I get it then? */
  }

  public async getAccount(): Promise<null | string> {
    return this.session?.state.accounts[0] || null
  }

  public async deactivate() {
    if (this.walletConnectProvider) {
      await this.walletConnectProvider.disconnect({
        topic: this.session?.topic!,
        reason: { code: 0 /* not sure which code to put */, message: 'Client disconnected' },
      })
    }
  }
}
