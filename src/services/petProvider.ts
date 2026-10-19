import { mockPets } from '../data/mockData'
import type { Pet } from '../types/pet'

export const DOG_API_RANDOM_URL = 'https://dog.ceo/api/breeds/image/random'

export interface DogApiResponse {
  message: string
  status: 'success' | 'error'
  code?: number
}

/**
 * Fetches a random dog image URL from The Dog API (dog.ceo).
 * The image URL is located at the JSON path `$.message`.
 */
export async function fetchRandomDogImage(fetchFn = fetch): Promise<string> {
  const response = await fetchFn(DOG_API_RANDOM_URL)
  if (!response.ok) {
    throw new Error(`The Dog API responded with HTTP status ${response.status}`)
  }

  const data = (await response.json()) as DogApiResponse
  if (data.status !== 'success' || !data.message) {
    throw new Error(`The Dog API returned an unsuccessful response: ${JSON.stringify(data)}`)
  }

  return data.message
}

/**
 * Preloads an image into browser cache to enable zero-latency rendering.
 * In test/Node environments or if network is slow, it resolves safely without blocking.
 */
export function preloadImage(src: string): Promise<void> {
  return new Promise((resolve) => {
    if (typeof Image === 'undefined' || import.meta.env?.MODE === 'test') {
      resolve()
      return
    }

    const img = new Image()
    let settled = false
    const done = () => {
      if (!settled) {
        settled = true
        resolve()
      }
    }

    img.onload = done
    img.onerror = done
    img.src = src

    if (img.complete) {
      done()
    } else {
      setTimeout(done, 1000)
    }
  })
}

/**
 * Merges a local pet profile (id, name, bio) with an external image URL.
 */
export function mergePetWithImage(localPet: Pet, imageUrl: string): Pet {
  return {
    ...localPet,
    image: imageUrl,
  }
}

/**
 * Loads a pet profile from local pets.json and merges it with a live random
 * dog image from The Dog API.
 *
 * If the API request fails (e.g., offline or network error), it gracefully
 * falls back to the bundled image URL from pets.json so the UI never breaks.
 */
export async function getPetWithLiveImage(
  petId: number = 1,
  fetchFn = fetch,
): Promise<Pet> {
  const localPet = mockPets.find((p) => p.id === petId) ?? mockPets[0]
  if (!localPet) {
    throw new Error(`No local pet profile found for id ${petId}`)
  }

  try {
    const liveImageUrl = await fetchRandomDogImage(fetchFn)
    const pet = mergePetWithImage(localPet, liveImageUrl)
    await preloadImage(pet.image)
    return pet
  } catch (error) {
    console.warn(
      `Failed to fetch live image from The Dog API; falling back to local image for pet "${localPet.name}".`,
      error,
    )
    return { ...localPet }
  }
}

/**
 * Returns all local pet profiles, attempting to supply fresh live images
 * while falling back safely to bundled images for any failures.
 */
export async function getPetsWithLiveImages(fetchFn = fetch): Promise<Pet[]> {
  return Promise.all(
    mockPets.map(async (pet) => {
      try {
        const liveImageUrl = await fetchRandomDogImage(fetchFn)
        return mergePetWithImage(pet, liveImageUrl)
      } catch {
        return { ...pet }
      }
    }),
  )
}

