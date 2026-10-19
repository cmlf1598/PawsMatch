import { describe, it, expect, beforeEach } from 'vitest'
import { useMatchStore } from './matchStore'

describe('match store', () => {
  beforeEach(() => {
    useMatchStore.setState({ liked: [], passed: [] })
  })

  it('records liked and passed pets separately', () => {
    const { like, pass } = useMatchStore.getState()
    like(1)
    pass(2)

    const { liked, passed } = useMatchStore.getState()
    expect(liked).toEqual([1])
    expect(passed).toEqual([2])
  })
})
