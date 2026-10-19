import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  fetchRandomDogImage,
  getPetWithLiveImage,
  getPetsWithLiveImages,
  mergePetWithImage,
  preloadImage,
  DOG_API_RANDOM_URL,
} from './petProvider'
import type { Pet } from '../types/pet'

describe('petProvider', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  describe('fetchRandomDogImage', () => {
    it('fetches from The Dog API and returns the image URL from $.message', async () => {
      const mockResponse = {
        message: 'https://images.dog.ceo/breeds/husky/n02110185_1469.jpg',
        status: 'success',
      }
      const customFetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => mockResponse,
      })

      const imageUrl = await fetchRandomDogImage(customFetch as unknown as typeof fetch)

      expect(customFetch).toHaveBeenCalledWith(DOG_API_RANDOM_URL)
      expect(imageUrl).toBe('https://images.dog.ceo/breeds/husky/n02110185_1469.jpg')
    })

    it('throws when the HTTP response is not ok', async () => {
      const customFetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
      })

      await expect(
        fetchRandomDogImage(customFetch as unknown as typeof fetch),
      ).rejects.toThrow('The Dog API responded with HTTP status 500')
    })

    it('throws when the Dog API returns status: error', async () => {
      const customFetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({ status: 'error', message: 'Breed not found' }),
      })

      await expect(
        fetchRandomDogImage(customFetch as unknown as typeof fetch),
      ).rejects.toThrow('The Dog API returned an unsuccessful response')
    })
  })

  describe('mergePetWithImage', () => {
    it('preserves pet attributes while overriding the image URL', () => {
      const basePet: Pet = {
        id: 1,
        name: 'Luna',
        bio: ['Line 1', 'Line 2', 'Line 3'],
        image: 'https://local-image.jpg',
      }
      const newUrl = 'https://images.dog.ceo/breeds/retriever/dog.jpg'

      const merged = mergePetWithImage(basePet, newUrl)

      expect(merged).toEqual({
        id: 1,
        name: 'Luna',
        bio: ['Line 1', 'Line 2', 'Line 3'],
        image: newUrl,
      })
    })
  })

  describe('getPetWithLiveImage', () => {
    it('returns the pet with the live API image when the request succeeds', async () => {
      const customFetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({
          message: 'https://images.dog.ceo/breeds/labrador/live.jpg',
          status: 'success',
        }),
      })

      const pet = await getPetWithLiveImage(1, customFetch as unknown as typeof fetch)

      expect(pet.id).toBe(1)
      expect(pet.name).toBe('Luna')
      expect(pet.image).toBe('https://images.dog.ceo/breeds/labrador/live.jpg')
    })

    it('gracefully falls back to the local image if the API call fails', async () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
      const customFetch = vi.fn().mockRejectedValue(new Error('Network error'))

      const pet = await getPetWithLiveImage(1, customFetch as unknown as typeof fetch)

      expect(pet.id).toBe(1)
      expect(pet.name).toBe('Luna')
      expect(pet.image).toMatch(/^https:\/\/images\.dog\.ceo\//)
      expect(warnSpy).toHaveBeenCalled()
    })
  })

  describe('getPetsWithLiveImages', () => {
    it('loads all pets and replaces images with live responses', async () => {
      const customFetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({
          message: 'https://images.dog.ceo/breeds/mix/live.jpg',
          status: 'success',
        }),
      })

      const pets = await getPetsWithLiveImages(customFetch as unknown as typeof fetch)

      expect(pets).toHaveLength(50)
      expect(pets[0].image).toBe('https://images.dog.ceo/breeds/mix/live.jpg')
    })
  })

  describe('preloadImage', () => {
    it('resolves cleanly without error', async () => {
      await expect(preloadImage('https://images.dog.ceo/test.jpg')).resolves.toBeUndefined()
    })
  })
})

