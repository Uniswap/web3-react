import { Connector } from '@web3-react/types'

class Empty extends Connector {
  provider: undefined

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  public activate() {}
}

// @ts-expect-error this is okay because actions aren't ever validated,
// and they're only used to set a protected property
export const EMPTY = new Empty()
