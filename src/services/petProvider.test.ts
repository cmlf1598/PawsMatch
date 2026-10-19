import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  fetchBreedImage,
  getBreedImageUrl,
  getPetWithLiveImage,
  getPetsWithLiveImages,
  mergePetWithImage,
  preloadImage,
} from './petProvider'
import { clearImageCache, getCachedImage, PET_IMAGE_STORAGE_KEY, setCachedImage } from './petImageCache'
import { mockPets } from '../data/mockData'
import type { Pet } from '../types/pet'

function dogApiResponse(message: string) {
  return { ok: true, status: 200, json: async () => ({ message, status: 'success' }) }
}

/** A fetch mock that answers with the given image URLs in order. */
function fetchReturning(...imageUrls: string[]) {
  const customFetch = vi.fn()
  for (const url of imageUrls) customFetch.mockResolvedValueOnce(dogApiResponse(url))
  return customFetch
}

describe('petProvider', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    clearImageCache()
  })

  describe('fetchBreedImage', () => {
    it('fetches a random image of the breed and returns the URL from $.message', async () => {
      const customFetch = fetchReturning('https://images.dog.ceo/breeds/retriever-golden/a.jpg')

      const imageUrl = await fetchBreedImage('retriever/golden', customFetch as unknown as typeof fetch)

      expect(customFetch).toHaveBeenCalledWith('https://dog.ceo/api/breed/retriever/golden/images/random')
      expect(imageUrl).toBe('https://images.dog.ceo/breeds/retriever-golden/a.jpg')
    })

    it('throws when the HTTP response is not ok', async () => {
      const customFetch = vi.fn().mockResolvedValue({ ok: false, status: 500 })

      await expect(
        fetchBreedImage('husky', customFetch as unknown as typeof fetch),
      ).rejects.toThrow('The Dog API responded with HTTP status 500')
    })

    it('throws when the Dog API returns status: error', async () => {
      const customFetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({ status: 'error', message: 'Breed not found' }),
      })

      await expect(
        fetchBreedImage('unknown', customFetch as unknown as typeof fetch),
      ).rejects.toThrow('The Dog API returned an unsuccessful response')
    })
  })

  describe('getBreedImageUrl', () => {
    it('supports sub-breed paths', () => {
      expect(getBreedImageUrl('labrador')).toBe('https://dog.ceo/api/breed/labrador/images/random')
      expect(getBreedImageUrl('bulldog/french')).toBe('https://dog.ceo/api/breed/bulldog/french/images/random')
    })
  })

  describe('mergePetWithImage', () => {
    it('preserves pet attributes while overriding the image URL', () => {
      const basePet: Pet = {
        id: 1,
        name: 'Luna',
        breed: 'mix',
        bio: ['Line 1', 'Line 2', 'Line 3'],
        image: 'https://local-image.jpg',
      }
      const newUrl = 'https://images.dog.ceo/breeds/retriever/dog.jpg'

      expect(mergePetWithImage(basePet, newUrl)).toEqual({ ...basePet, image: newUrl })
    })
  })

  describe('getPetWithLiveImage', () => {
    it("fetches a live image of the pet's own breed", async () => {
      const max = mockPets.find((pet) => pet.name === 'Max')!
      const customFetch = fetchReturning('https://images.dog.ceo/breeds/labrador/live.jpg')

      const pet = await getPetWithLiveImage(max.id, customFetch as unknown as typeof fetch)

      expect(customFetch).toHaveBeenCalledWith(getBreedImageUrl('labrador'))
      expect(pet.name).toBe('Max')
      expect(pet.image).toBe('https://images.dog.ceo/breeds/labrador/live.jpg')
    })

    it('keeps the same photo on later loads instead of fetching a new one', async () => {
      const customFetch = fetchReturning(
        'https://images.dog.ceo/breeds/mix/first.jpg',
        'https://images.dog.ceo/breeds/mix/second.jpg',
      )

      const first = await getPetWithLiveImage(1, customFetch as unknown as typeof fetch)
      const second = await getPetWithLiveImage(1, customFetch as unknown as typeof fetch)

      expect(customFetch).toHaveBeenCalledOnce()
      expect(second.image).toBe(first.image)
    })

    it('remembers the photo in localStorage so it survives a page reload', async () => {
      const customFetch = fetchReturning('https://images.dog.ceo/breeds/mix/stored.jpg')

      await getPetWithLiveImage(1, customFetch as unknown as typeof fetch)

      expect(JSON.parse(localStorage.getItem(PET_IMAGE_STORAGE_KEY)!)).toEqual({
        1: 'https://images.dog.ceo/breeds/mix/stored.jpg',
      })
    })

    it('fetches again when the photo is already used by another pet', async () => {
      setCachedImage(9, 'https://images.dog.ceo/breeds/mix/taken.jpg')
      const customFetch = fetchReturning(
        'https://images.dog.ceo/breeds/mix/taken.jpg',
        'https://images.dog.ceo/breeds/mix/free.jpg',
      )

      const pet = await getPetWithLiveImage(1, customFetch as unknown as typeof fetch)

      expect(customFetch).toHaveBeenCalledTimes(2)
      expect(pet.image).toBe('https://images.dog.ceo/breeds/mix/free.jpg')
    })

    it('falls back to the local image if the API call fails, without remembering it', async () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
      const customFetch = vi.fn().mockRejectedValue(new Error('Network error'))

      const pet = await getPetWithLiveImage(1, customFetch as unknown as typeof fetch)

      expect(pet.name).toBe('Luna')
      expect(pet.image).toBe(mockPets[0].image)
      expect(warnSpy).toHaveBeenCalled()
      expect(getCachedImage(1)).toBeUndefined()
    })
  })

  describe('getPetsWithLiveImages', () => {
    it('loads all pets with a live image of each breed', async () => {
      let counter = 0
      const customFetch = vi.fn().mockImplementation(async () =>
        dogApiResponse(`https://images.dog.ceo/breeds/live-${++counter}.jpg`),
      )

      const pets = await getPetsWithLiveImages(customFetch as unknown as typeof fetch)

      expect(pets).toHaveLength(50)
      expect(new Set(pets.map((pet) => pet.image)).size).toBe(50)
      for (const pet of mockPets) {
        expect(customFetch).toHaveBeenCalledWith(getBreedImageUrl(pet.breed))
      }
    })
  })

  describe('preloadImage', () => {
    it('resolves cleanly without error', async () => {
      await expect(preloadImage('https://images.dog.ceo/test.jpg')).resolves.toBeUndefined()
    })
  })
})
