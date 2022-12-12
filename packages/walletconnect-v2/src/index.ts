import { Actions, Connector } from '@web3-react/types'

type WalletConnectConstructorArgs = {
  actions: Actions
  onError?: (error: Error) => void
}

export class WalletConnect extends Connector {
  constructor({ actions, onError }: WalletConnectConstructorArgs) {
    super(actions, onError)
  }

  public activate() {
    void 0
  }
}
