import { describe, it, expect } from 'vitest'
import { mockPets } from './mockData'

describe('mockData', () => {
  it('contains 50 mock pets conforming to the Pet interface', () => {
    expect(mockPets).toHaveLength(50)
    expect(mockPets[0]).toMatchObject({
      id: 1,
      name: expect.any(String),
      bio: expect.any(Array),
      image: expect.any(String),
    })
  })
})

