import { Actions, Connector } from '@web3-react/types'
import type { EventEmitter } from 'node:events'
import WalletConnectProvider from '@walletconnect/client'
import { CLIENT_EVENTS } from '@walletconnect/client'
import { ClientOptions, PairingTypes, SessionTypes } from '@walletconnect/types'

interface MockWalletConnectProvider
  extends Omit<WalletConnectProvider, 'on' | 'off' | 'once' | 'removeListener'>,
    EventEmitter {}

export class WalletConnect extends Connector {
  private readonly options?: ClientOptions
  private providerPromise?: Promise<void>

  public provider: MockWalletConnectProvider // type error

  session?: SessionTypes.Settled

  constructor(actions: Actions, options?: ClientOptions, connectEagerly = true) {
    super(actions)
    this.options = options

    if (connectEagerly) {
      this.providerPromise = this.startListening(connectEagerly)
    }
  }

  private async startListening(connectEagerly: boolean): Promise<void> {
    const client = await (await import('@walletconnect/client').then((m) => m.default)).init()

    client.on(CLIENT_EVENTS.pairing.proposal, async (proposal: PairingTypes.Proposal) => {
      const { uri } = proposal.signal.params
      // how should we handle URI?
    })

    if ((client.session?.topics || []).length) {
      const session = await client.connect({})
      this.session = session
      // where do we handle a session?
    }

    this.provider = new WalletConnectProvider(this.options) as unknown as MockWalletConnectProvider

    this.provider.on('disconnect', (error: Error): void => {
      this.actions.reportError(error)
    })
    this.provider.on('chainChanged', (chainId: number): void => {
      this.actions.update({ chainId })
    })
    this.provider.on('accountsChanged', (accounts: string[]): void => {
      this.actions.update({ accounts })
    })

    // silently attempt to eagerly connect
    if (connectEagerly && this.provider.connected) {
      // WC v2 has it's own session events so this needs to be rewritten
      Promise.all([
        this.provider.request({ request: { method: 'eth_chainId' }, topic: this.session!.topic }) as Promise<number>,
        this.provider.request({ request: { method: 'eth_accounts' }, topic: this.session!.topic }) as Promise<string[]>,
      ])
        .then(([chainId, accounts]) => {
          if (accounts.length > 0) {
            this.actions.update({ chainId, accounts })
          }
        })
        .catch((error) => {
          console.debug('Could not connect eagerly', error)
        })
    }
  }

  public async activate(): Promise<void> {
    this.actions.startActivation()

    if (!this.providerPromise) {
      this.providerPromise = this.startListening(false)
    }
    await this.providerPromise
    // this.provider guaranteed to be defined now

    await Promise.all([
      this.provider!.request({ request: { method: 'eth_chainId' }, topic: this.session!.topic }) as Promise<number>,
      this.provider!.request({ request: { method: 'eth_requestAccounts' }, topic: this.session!.topic }) as Promise<
        string[]
      >,
    ])
      .then(([chainId, accounts]) => {
        this.actions.update({ chainId, accounts })
      })
      .catch((error) => {
        this.actions.reportError(error)
      })
  }

  public async deactivate(): Promise<void> {
    if (this.provider) {
      await this.provider.disconnect({ topic: this.session!.topic, reason: { code: 0, message: 'Disconnect' } }) // not sure which code
    }
  }
}
