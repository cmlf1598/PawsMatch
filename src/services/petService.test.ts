import { describe, it, expect } from 'vitest'
import { getPets } from './petService'

describe('getPets', () => {
  it('returns every pet profile with a 3-line bio and an image', async () => {
    const pets = await getPets()

    expect(pets).toHaveLength(50)
    for (const pet of pets) {
      expect(pet.name).toBeTruthy()
      expect(pet.bio).toHaveLength(3)
      expect(pet.image).toMatch(/^https:\/\/images\.dog\.ceo\//)
    }
  })
})
