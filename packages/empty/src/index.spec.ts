import { EMPTY } from '.'

describe('EMPTY', () => {
  test('#activate', () => {
    EMPTY.activate()
    expect(EMPTY.provider).toBeUndefined()
  })
})
