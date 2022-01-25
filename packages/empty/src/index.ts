import { Connector } from '@web3-react/types'

class Empty extends Connector {
  /** {@inheritdoc Connector.provider} */
  provider: undefined

  /**
   * No-op. May be called if it simplifies application code.
   */
  public activate() {
    void 0
  }
}

// @ts-expect-error actions aren't validated and are only used to set a protected property, so this is ok
export const EMPTY = new Empty()
