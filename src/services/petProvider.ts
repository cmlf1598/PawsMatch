import { mockPets } from '../data/mockData'
import { getCachedImage, isImageUsedByAnotherPet, setCachedImage } from './petImageCache'
import type { Pet } from '../types/pet'

export const DOG_API_BASE_URL = 'https://dog.ceo/api'

/** Retries when a new photo is already shown for another pet (e.g. two 'mix' dogs). */
const MAX_UNIQUE_IMAGE_ATTEMPTS = 3

export interface DogApiResponse {
  message: string
  status: 'success' | 'error'
  code?: number
}

/** e.g. 'retriever/golden' → 'https://dog.ceo/api/breed/retriever/golden/images/random' */
export function getBreedImageUrl(breed: string): string {
  return `${DOG_API_BASE_URL}/breed/${breed}/images/random`
}

/**
 * Fetches a random image of the given breed from The Dog API (dog.ceo).
 * The image URL is located at the JSON path `$.message`.
 */
export async function fetchBreedImage(breed: string, fetchFn = fetch): Promise<string> {
  const response = await fetchFn(getBreedImageUrl(breed))
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
 * Returns the pet's remembered live photo, or fetches a new photo of its breed and
 * remembers it, so each dog is fetched once and keeps the same photo afterwards.
 * Throws if the API call fails, so callers can fall back to the bundled image.
 */
async function getStableLiveImage(pet: Pet, fetchFn: typeof fetch): Promise<string> {
  const cachedImage = getCachedImage(pet.id)
  if (cachedImage) return cachedImage

  let imageUrl = await fetchBreedImage(pet.breed, fetchFn)
  for (
    let attempt = 1;
    attempt < MAX_UNIQUE_IMAGE_ATTEMPTS && isImageUsedByAnotherPet(imageUrl, pet.id);
    attempt++
  ) {
    imageUrl = await fetchBreedImage(pet.breed, fetchFn)
  }

  setCachedImage(pet.id, imageUrl)
  return imageUrl
}

/**
 * Loads a pet profile from local pets.json and merges it with a live image of
 * the pet's breed from The Dog API. The image is fetched once per pet and
 * remembered (see petImageCache), so the dog looks the same every time.
 *
 * If the API request fails (e.g., offline or network error), it gracefully
 * falls back to the bundled image URL from pets.json so the UI never breaks.
 * The fallback isn't remembered, so a later load can still pick a live photo.
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
    const liveImageUrl = await getStableLiveImage(localPet, fetchFn)
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
 * Returns all local pet profiles with their live breed images (fetched once per
 * pet and remembered), falling back safely to bundled images for any failures.
 */
export async function getPetsWithLiveImages(fetchFn = fetch): Promise<Pet[]> {
  return Promise.all(
    mockPets.map(async (pet) => {
      try {
        const liveImageUrl = await getStableLiveImage(pet, fetchFn)
        return mergePetWithImage(pet, liveImageUrl)
      } catch {
        return { ...pet }
      }
    }),
  )
}

