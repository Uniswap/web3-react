import type { Actions } from '@web3-react/types'
import { Connector } from '@web3-react/types'

export class Empty extends Connector {
  constructor(actions: Actions) {
    super(actions)
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  public async activate(): Promise<void> {}
}
